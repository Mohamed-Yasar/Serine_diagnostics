import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

/**
 * GET all lab tests
 *
 * Public endpoint.
 * Used by the frontend catalog and booking pages.
 */
router.get('/', async (_req, res) => {
  try {
    const tests = await prisma.labTest.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return res.json({
      success: true,
      count: tests.length,
      data: tests,
    });
  } catch (error) {
    console.error('Error fetching lab tests:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch lab tests',
    });
  }
});

/**
 * GET frequently ordered lab tests
 *
 * Public endpoint.
 * Returns the top 6 individual tests ordered during the
 * rolling 90-day period, counting only CONFIRMED and COMPLETED
 * appointments.
 */
router.get('/frequently-ordered', async (_req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const grouped = await prisma.appointmentTest.groupBy({
      by: ['testId'],
      where: {
        testId: {
          not: null,
        },
        appointment: {
          appointmentDate: {
            gte: since,
          },
          status: {
            in: ['CONFIRMED', 'COMPLETED'],
          },
        },
        test: {
          active: true,
          bookable: true,
        },
      },
      _count: {
        testId: true,
      },
      orderBy: {
        _count: {
          testId: 'desc',
        },
      },
      take: 6,
    });

    const testIds = grouped
      .map((item) => item.testId)
      .filter((id): id is string => Boolean(id));

    if (testIds.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const tests = await prisma.labTest.findMany({
      where: {
        id: {
          in: testIds,
        },
      },
    });

    const testsById = new Map(
      tests.map((test) => [test.id, test])
    );

    const data = grouped
      .map((item) => {
        if (!item.testId) return null;

        const test = testsById.get(item.testId);
        if (!test) return null;

        return {
          ...test,
          orderCount: item._count.testId,
        };
      })
      .filter((test): test is NonNullable<typeof test> => Boolean(test));

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Error fetching frequently ordered lab tests:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch frequently ordered lab tests',
    });
  }
});

/**
 * GET one lab test by ID or code
 *
 * Public endpoint.
 *
 * Examples:
 * GET /api/tests/clu123...
 * GET /api/tests/CBC
 */
/**
 * GET frequently ordered lab tests
 *
 * Public endpoint.
 *
 * Returns the top 6 individual tests ordered through
 * confirmed or completed appointments during the
 * previous 90 days.
 */
router.get('/frequently-ordered', async (_req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get individual test bookings from qualifying appointments.
    // Package-only appointment rows have testId = null,
    // so they are intentionally ignored here.
    const appointmentTests = await prisma.appointmentTest.findMany({
      where: {
        testId: {
          not: null,
        },
        appointment: {
          appointmentDate: {
            gte: ninetyDaysAgo,
          },
          status: {
            in: ['CONFIRMED', 'COMPLETED'],
          },
        },
      },
      select: {
        testId: true,
      },
    });

    // Count orders for each test.
    const orderCounts = new Map<string, number>();

    for (const appointmentTest of appointmentTests) {
      if (!appointmentTest.testId) {
        continue;
      }

      orderCounts.set(
        appointmentTest.testId,
        (orderCounts.get(appointmentTest.testId) || 0) + 1
      );
    }

    // Sort by order count and take the top 6.
    const topTestIds = Array.from(orderCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    if (topTestIds.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Fetch the actual LabTest records.
    const tests = await prisma.labTest.findMany({
      where: {
        id: {
          in: topTestIds.map(([testId]) => testId),
        },
        active: true,
        bookable: true,
      },
    });

    // Keep the order determined by the booking counts.
    const testMap = new Map(
      tests.map((test) => [test.id, test])
    );

    const data = topTestIds
      .map(([testId, orderCount]) => {
        const test = testMap.get(testId);

        if (!test) {
          return null;
        }

        return {
          ...test,
          orderCount,
        };
      })
      .filter(Boolean);

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(
      'Error fetching frequently ordered lab tests:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch frequently ordered lab tests',
    });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const test = await prisma.labTest.findFirst({
      where: {
        OR: [
          { id: req.params.id },
          { code: req.params.id },
        ],
      },
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found',
      });
    }

    return res.json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error('Error fetching lab test:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch lab test',
    });
  }
});

/**
 * POST create a new lab test
 *
 * ADMIN ONLY
 *
 * Flow:
 * JWT → authenticateToken → ADMIN role → Prisma → PostgreSQL
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const {
        code,
        name,
        category,
        categoryLabel,
        description,
        price,
        fastingRequired,
        fastingHours,
        turnaroundTime,
        specimenType,
        whyItIsDone,
        whatItHelpsEvaluate,
        clinicalSignificance,
        abnormalSymptoms,
        specimenVolume,
        collectionKit,
        patientPreparation,
        importantInformation,
        whatIsTested,
        relatedTests,
        active,
        popular,
        commonFor,
        source,
        itemType,
        bookable,
        tags,
      } = req.body;

      // ----------------------------------------
      // Required field validation
      // ----------------------------------------

      if (
        !code ||
        !name ||
        !category ||
        !categoryLabel ||
        !description
      ) {
        return res.status(400).json({
          success: false,
          message:
            'code, name, category, categoryLabel, and description are required',
        });
      }

      // ----------------------------------------
      // Validate arrays
      // ----------------------------------------

      if (whatIsTested !== undefined && !Array.isArray(whatIsTested)) {
        return res.status(400).json({
          success: false,
          message: 'whatIsTested must be an array',
        });
      }

      if (relatedTests !== undefined && !Array.isArray(relatedTests)) {
        return res.status(400).json({
          success: false,
          message: 'relatedTests must be an array',
        });
      }

      if (commonFor !== undefined && !Array.isArray(commonFor)) {
        return res.status(400).json({
          success: false,
          message: 'commonFor must be an array',
        });
      }

      if (tags !== undefined && !Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          message: 'tags must be an array',
        });
      }

      // ----------------------------------------
      // Validate price
      // ----------------------------------------

      const numericPrice = Number(price ?? 0);

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'price must be a valid non-negative number',
        });
      }

      // ----------------------------------------
      // Validate fasting hours
      // ----------------------------------------

      let numericFastingHours: number | null = null;

      if (
        fastingHours !== undefined &&
        fastingHours !== null &&
        fastingHours !== ''
      ) {
        numericFastingHours = Number(fastingHours);

        if (
          !Number.isInteger(numericFastingHours) ||
          numericFastingHours < 0
        ) {
          return res.status(400).json({
            success: false,
            message: 'fastingHours must be a valid non-negative integer',
          });
        }
      }

      // ----------------------------------------
      // Prevent duplicate test codes
      // ----------------------------------------

      const existingTest = await prisma.labTest.findUnique({
        where: {
          code,
        },
      });

      if (existingTest) {
        return res.status(409).json({
          success: false,
          message: `A test with code "${code}" already exists`,
        });
      }

      // ----------------------------------------
      // Create test
      // ----------------------------------------

      const test = await prisma.labTest.create({
        data: {
          code,
          name,
          category,
          categoryLabel,
          description,

          price: numericPrice,

          fastingRequired: fastingRequired ?? false,
          fastingHours: numericFastingHours,

          turnaroundTime: turnaroundTime ?? '',
          specimenType: specimenType ?? '',

          whyItIsDone: whyItIsDone ?? null,
          whatItHelpsEvaluate: whatItHelpsEvaluate ?? null,

          clinicalSignificance: clinicalSignificance ?? '',
          abnormalSymptoms: abnormalSymptoms ?? null,

          specimenVolume: specimenVolume ?? null,
          collectionKit: collectionKit ?? null,
          patientPreparation: patientPreparation ?? null,
          importantInformation: importantInformation ?? null,

          whatIsTested: Array.isArray(whatIsTested)
            ? whatIsTested
            : [],

          relatedTests: Array.isArray(relatedTests)
            ? relatedTests
            : [],

          active: active ?? true,
          popular: popular ?? false,

          commonFor: Array.isArray(commonFor)
            ? commonFor
            : [],

          source: source ?? 'SERINE',
          itemType: itemType ?? 'TEST',
          bookable: bookable ?? true,

          tags: Array.isArray(tags)
            ? tags
            : [],
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Lab test created successfully',
        data: test,
      });
    } catch (error) {
      console.error('Create lab test error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to create lab test',
      });
    }
  }
);

/**
 * PATCH update an existing lab test
 *
 * ADMIN ONLY
 *
 * The test code is intentionally NOT editable.
 * Other fields can be updated individually.
 */
router.patch(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // ----------------------------------------
      // Find existing test
      // ----------------------------------------

      const existingTest = await prisma.labTest.findFirst({
        where: {
          OR: [
            { id },
            { code: id },
          ],
        },
      });

      if (!existingTest) {
        return res.status(404).json({
          success: false,
          message: 'Lab test not found',
        });
      }

      const {
        name,
        category,
        categoryLabel,
        description,
        price,
        fastingRequired,
        fastingHours,
        turnaroundTime,
        specimenType,
        whyItIsDone,
        whatItHelpsEvaluate,
        clinicalSignificance,
        abnormalSymptoms,
        specimenVolume,
        collectionKit,
        patientPreparation,
        importantInformation,
        whatIsTested,
        relatedTests,
        active,
        popular,
        commonFor,
        source,
        itemType,
        bookable,
        tags,
      } = req.body;

      // ----------------------------------------
      // Validate arrays when provided
      // ----------------------------------------

      if (
        whatIsTested !== undefined &&
        !Array.isArray(whatIsTested)
      ) {
        return res.status(400).json({
          success: false,
          message: 'whatIsTested must be an array',
        });
      }

      if (
        relatedTests !== undefined &&
        !Array.isArray(relatedTests)
      ) {
        return res.status(400).json({
          success: false,
          message: 'relatedTests must be an array',
        });
      }

      if (
        commonFor !== undefined &&
        !Array.isArray(commonFor)
      ) {
        return res.status(400).json({
          success: false,
          message: 'commonFor must be an array',
        });
      }

      if (
        tags !== undefined &&
        !Array.isArray(tags)
      ) {
        return res.status(400).json({
          success: false,
          message: 'tags must be an array',
        });
      }

      // ----------------------------------------
      // Validate price when provided
      // ----------------------------------------

      let numericPrice: number | undefined;

      if (price !== undefined) {
        numericPrice = Number(price);

        if (
          !Number.isFinite(numericPrice) ||
          numericPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message: 'price must be a valid non-negative number',
          });
        }
      }

      // ----------------------------------------
      // Validate fasting hours when provided
      // ----------------------------------------

      let numericFastingHours: number | null | undefined;

      if (fastingHours !== undefined) {
        if (
          fastingHours === null ||
          fastingHours === ''
        ) {
          numericFastingHours = null;
        } else {
          numericFastingHours = Number(fastingHours);

          if (
            !Number.isInteger(numericFastingHours) ||
            numericFastingHours < 0
          ) {
            return res.status(400).json({
              success: false,
              message:
                'fastingHours must be a valid non-negative integer',
            });
          }
        }
      }

      // ----------------------------------------
      // Build update object
      // ----------------------------------------

      const updateData: any = {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(categoryLabel !== undefined && {
          categoryLabel,
        }),
        ...(description !== undefined && {
          description,
        }),

        ...(numericPrice !== undefined && {
          price: numericPrice,
        }),

        ...(fastingRequired !== undefined && {
          fastingRequired,
        }),

        ...(numericFastingHours !== undefined && {
          fastingHours: numericFastingHours,
        }),

        ...(turnaroundTime !== undefined && {
          turnaroundTime,
        }),

        ...(specimenType !== undefined && {
          specimenType,
        }),

        ...(whyItIsDone !== undefined && {
          whyItIsDone,
        }),

        ...(whatItHelpsEvaluate !== undefined && {
          whatItHelpsEvaluate,
        }),

        ...(clinicalSignificance !== undefined && {
          clinicalSignificance,
        }),

        ...(abnormalSymptoms !== undefined && {
          abnormalSymptoms,
        }),

        ...(specimenVolume !== undefined && {
          specimenVolume,
        }),

        ...(collectionKit !== undefined && {
          collectionKit,
        }),

        ...(patientPreparation !== undefined && {
          patientPreparation,
        }),

        ...(importantInformation !== undefined && {
          importantInformation,
        }),

        ...(whatIsTested !== undefined && {
          whatIsTested,
        }),

        ...(relatedTests !== undefined && {
          relatedTests,
        }),

        ...(active !== undefined && {
          active,
        }),

        ...(popular !== undefined && {
          popular,
        }),

        ...(commonFor !== undefined && {
          commonFor,
        }),

        ...(source !== undefined && {
          source,
        }),

        ...(itemType !== undefined && {
          itemType,
        }),

        ...(bookable !== undefined && {
          bookable,
        }),

        ...(tags !== undefined && {
          tags,
        }),
      };

      // ----------------------------------------
      // Update test
      // ----------------------------------------

      const updatedTest = await prisma.labTest.update({
        where: {
          id: existingTest.id,
        },
        data: updateData,
      });

      return res.json({
        success: true,
        message: 'Lab test updated successfully',
        data: updatedTest,
      });
    } catch (error) {
      console.error('Update lab test error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to update lab test',
      });
    }
  }
);

/**
 * DELETE a lab test
 *
 * ADMIN ONLY
 *
 * This is a SOFT DELETE.
 * We do not physically delete the record because
 * appointments/orders may already reference this test.
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const existingTest = await prisma.labTest.findFirst({
        where: {
          OR: [
            { id },
            { code: id },
          ],
        },
      });

      if (!existingTest) {
        return res.status(404).json({
          success: false,
          message: 'Lab test not found',
        });
      }

      const updatedTest = await prisma.labTest.update({
        where: {
          id: existingTest.id,
        },
        data: {
          active: false,
          bookable: false,
        },
      });

      return res.json({
        success: true,
        message: 'Lab test deactivated successfully',
        data: updatedTest,
      });
    } catch (error) {
      console.error('Deactivate lab test error:', error);

      return res.status(500).json({
        success: false,   
        message: 'Failed to deactivate lab test',
      });
    }
  }
);

export default router;