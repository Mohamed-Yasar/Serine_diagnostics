import { Router } from 'express';
import { prisma } from '../prisma';
import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/auth';

const router = Router();

const packageInclude = {
  tests: {
    include: {
      test: true,
    },
  },
};

type PackageInput = {
  name?: string;
  badge?: string | null;
  tagline?: string;
  description?: string;
  price?: number;
  originalValue?: number;
  fastingRequired?: boolean;
  turnaroundTime?: string;
  recommendedFor?: string;
  featured?: boolean;
  active?: boolean;
  testIds?: string[];
};

function validatePackageInput(
  body: PackageInput,
  isCreate = false
) {
  if (isCreate && !body.name?.trim()) {
    return 'Package name is required.';
  }

  if (body.name !== undefined && !body.name.trim()) {
    return 'Package name cannot be empty.';
  }

  if (
    body.description !== undefined &&
    !body.description.trim()
  ) {
    return 'Package description cannot be empty.';
  }

  if (
    body.tagline !== undefined &&
    !body.tagline.trim()
  ) {
    return 'Package tagline cannot be empty.';
  }

  if (
    body.recommendedFor !== undefined &&
    !body.recommendedFor.trim()
  ) {
    return 'Recommended-for information is required.';
  }

  if (
    body.turnaroundTime !== undefined &&
    !body.turnaroundTime.trim()
  ) {
    return 'Turnaround time is required.';
  }

  if (
    body.price !== undefined &&
    (typeof body.price !== 'number' ||
      Number.isNaN(body.price) ||
      body.price < 0)
  ) {
    return 'Price must be a valid non-negative number.';
  }

  if (
    body.originalValue !== undefined &&
    (typeof body.originalValue !== 'number' ||
      Number.isNaN(body.originalValue) ||
      body.originalValue < 0)
  ) {
    return 'Original value must be a valid non-negative number.';
  }

  if (
    body.testIds !== undefined &&
    (!Array.isArray(body.testIds) ||
      body.testIds.some(
        (testId) =>
          typeof testId !== 'string' ||
          !testId.trim()
      ))
  ) {
    return 'testIds must be an array of valid test IDs.';
  }

  return null;
}

// ============================================================
// ADMIN - GET ALL LAB PACKAGES
// ============================================================

router.get(
  '/admin',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (_req, res) => {
    try {
      const packages =
        await prisma.labPackage.findMany({
          include: packageInclude,
          orderBy: {
            createdAt: 'desc',
          },
        });

      res.json({
        success: true,
        count: packages.length,
        data: packages.map((pkg) => ({
          ...pkg,
          testIds: pkg.tests.map(
            (packageTest) =>
              packageTest.testId
          ),
        })),
      });
    } catch (error) {
      console.error(
        'Error fetching admin lab packages:',
        error
      );

      res.status(500).json({
        success: false,
        message:
          'Failed to fetch lab packages',
      });
    }
  }
);

// ============================================================
// ADMIN - CREATE LAB PACKAGE
// ============================================================

router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const body =
        req.body as PackageInput;

      const validationError =
        validatePackageInput(
          body,
          true
        );

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      const testIds = body.testIds || [];

      // Make sure all selected tests actually exist.
      if (testIds.length > 0) {
        const tests =
          await prisma.labTest.findMany({
            where: {
              id: {
                in: testIds,
              },
            },
            select: {
              id: true,
            },
          });

        if (tests.length !== testIds.length) {
          return res.status(400).json({
            success: false,
            message:
              'One or more selected tests could not be found.',
          });
        }
      }

      const createdPackage =
        await prisma.$transaction(
          async (tx) => {
            const newPackage =
              await tx.labPackage.create({
                data: {
                  name: body.name!.trim(),
                  badge:
                    body.badge?.trim() ||
                    null,
                  tagline:
                    body.tagline?.trim() || '',
                  description:
                    body.description?.trim() ||
                    '',
                  price:
                    body.price ?? 0,
                  originalValue:
                    body.originalValue ??
                    body.price ??
                    0,
                  fastingRequired:
                    body.fastingRequired ??
                    false,
                  turnaroundTime:
                    body.turnaroundTime?.trim() ||
                    '',
                  recommendedFor:
                    body.recommendedFor?.trim() ||
                    '',
                  featured:
                    body.featured ?? false,
                  active:
                    body.active ?? true,
                  testCount:
                    testIds.length,
                },
              });

            if (testIds.length > 0) {
              await tx.packageTest.createMany({
                data: testIds.map(
                  (testId) => ({
                    packageId:
                      newPackage.id,
                    testId,
                  })
                ),
              });
            }

            return newPackage;
          }
        );

      const result =
        await prisma.labPackage.findUnique({
          where: {
            id: createdPackage.id,
          },
          include: packageInclude,
        });

      res.status(201).json({
        success: true,
        message:
          'Lab package created successfully.',
        data: {
          ...result,
          testIds:
            result?.tests.map(
              (packageTest) =>
                packageTest.testId
            ) || [],
        },
      });
    } catch (error) {
      console.error(
        'Error creating lab package:',
        error
      );

      res.status(500).json({
        success: false,
        message:
          'Failed to create lab package',
      });
    }
  }
);

// ============================================================
// ADMIN - UPDATE LAB PACKAGE
// ============================================================

router.patch(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const body =
        req.body as PackageInput;

      const validationError =
        validatePackageInput(body);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      const existingPackage =
        await prisma.labPackage.findUnique({
          where: {
            id: req.params.id,
          },
        });

      if (!existingPackage) {
        return res.status(404).json({
          success: false,
          message:
            'Lab package not found.',
        });
      }

      const testIds = body.testIds;

      // If testIds were supplied, verify them.
      if (testIds !== undefined) {
        if (testIds.length > 0) {
          const tests =
            await prisma.labTest.findMany({
              where: {
                id: {
                  in: testIds,
                },
              },
              select: {
                id: true,
              },
            });

          if (
            tests.length !==
            testIds.length
          ) {
            return res.status(400).json({
              success: false,
              message:
                'One or more selected tests could not be found.',
            });
          }
        }
      }

      const updatedPackage =
        await prisma.$transaction(
          async (tx) => {
            const packageData: Record<
              string,
              unknown
            > = {};

            if (body.name !== undefined) {
              packageData.name =
                body.name.trim();
            }

            if (body.badge !== undefined) {
              packageData.badge =
                body.badge?.trim() ||
                null;
            }

            if (
              body.tagline !== undefined
            ) {
              packageData.tagline =
                body.tagline.trim();
            }

            if (
              body.description !==
              undefined
            ) {
              packageData.description =
                body.description.trim();
            }

            if (
              body.price !== undefined
            ) {
              packageData.price =
                body.price;
            }

            if (
              body.originalValue !==
              undefined
            ) {
              packageData.originalValue =
                body.originalValue;
            }

            if (
              body.fastingRequired !==
              undefined
            ) {
              packageData.fastingRequired =
                body.fastingRequired;
            }

            if (
              body.turnaroundTime !==
              undefined
            ) {
              packageData.turnaroundTime =
                body.turnaroundTime.trim();
            }

            if (
              body.recommendedFor !==
              undefined
            ) {
              packageData.recommendedFor =
                body.recommendedFor.trim();
            }

            if (
              body.featured !== undefined
            ) {
              packageData.featured =
                body.featured;
            }

            if (
              body.active !== undefined
            ) {
              packageData.active =
                body.active;
            }

            if (testIds !== undefined) {
              packageData.testCount =
                testIds.length;
            }

            await tx.labPackage.update({
              where: {
                id: req.params.id,
              },
              data: packageData,
            });

            // Replace package/test
            // relationships when supplied.
            if (testIds !== undefined) {
              await tx.packageTest.deleteMany({
                where: {
                  packageId:
                    req.params.id,
                },
              });

              if (testIds.length > 0) {
                await tx.packageTest.createMany({
                  data: testIds.map(
                    (testId) => ({
                      packageId:
                        req.params.id,
                      testId,
                    })
                  ),
                });
              }
            }

            return tx.labPackage.findUnique({
              where: {
                id: req.params.id,
              },
              include: packageInclude,
            });
          }
        );

      res.json({
        success: true,
        message:
          'Lab package updated successfully.',
        data: {
          ...updatedPackage,
          testIds:
            updatedPackage?.tests.map(
              (packageTest) =>
                packageTest.testId
            ) || [],
        },
      });
    } catch (error) {
      console.error(
        'Error updating lab package:',
        error
      );

      res.status(500).json({
        success: false,
        message:
          'Failed to update lab package',
      });
    }
  }
);

// ============================================================
// ADMIN - DEACTIVATE LAB PACKAGE
// ============================================================

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const existingPackage =
        await prisma.labPackage.findUnique({
          where: {
            id: req.params.id,
          },
        });

      if (!existingPackage) {
        return res.status(404).json({
          success: false,
          message:
            'Lab package not found.',
        });
      }

      const updatedPackage =
        await prisma.labPackage.update({
          where: {
            id: req.params.id,
          },
          data: {
            active: false,
          },
          include: packageInclude,
        });

      res.json({
        success: true,
        message:
          'Lab package deactivated successfully.',
        data: {
          ...updatedPackage,
          testIds:
            updatedPackage.tests.map(
              (packageTest) =>
                packageTest.testId
            ),
        },
      });
    } catch (error) {
      console.error(
        'Error deactivating lab package:',
        error
      );

      res.status(500).json({
        success: false,
        message:
          'Failed to deactivate lab package',
      });
    }
  }
);

// ============================================================
// PUBLIC - GET ALL ACTIVE LAB PACKAGES
// ============================================================

router.get('/', async (_req, res) => {
  try {
    const packages =
      await prisma.labPackage.findMany({
        where: {
          active: true,
        },
        include: packageInclude,
        orderBy: {
          price: 'asc',
        },
      });

    res.json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    console.error(
      'Error fetching lab packages:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch lab packages',
    });
  }
});

// ============================================================
// PUBLIC - GET ONE LAB PACKAGE
// ============================================================

router.get('/:id', async (req, res) => {
  try {
    const labPackage =
      await prisma.labPackage.findUnique({
        where: {
          id: req.params.id,
        },
        include: packageInclude,
      });

    if (!labPackage) {
      return res.status(404).json({
        success: false,
        message:
          'Lab package not found',
      });
    }

    res.json({
      success: true,
      data: labPackage,
    });
  } catch (error) {
    console.error(
      'Error fetching lab package:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch lab package',
    });
  }
});

export default router;