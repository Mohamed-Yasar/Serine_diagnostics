import React, { useEffect, useState } from 'react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StaffManagementPageProps {
  onNavigate?: (view: string) => void;
}

export const StaffManagementPage: React.FC<StaffManagementPageProps> = ({
  onNavigate,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<
  'DOCTOR' | 'STAFF' | 'PROVIDER'
>('DOCTOR');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'DOCTOR' | 'STAFF' | 'PROVIDER'>('DOCTOR');
  const [editPassword, setEditPassword] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadUsers = async () => {
  try {
    const token = localStorage.getItem(
      'serine_auth_token'
    );
    
    if (!token) {
      throw new Error(
        'Authentication token is required'
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          'Failed to fetch users'
      );
    }

    setUsers(result.users);
  } catch (error) {
    console.error(
      'Failed to load users:',
      error
    );
  }
};

const startEditingUser = (user: StaffUser) => {
  setEditingUser(user);
  setEditFirstName(user.firstName);
  setEditLastName(user.lastName);
  setEditEmail(user.email);
  setEditRole(user.role as 'DOCTOR' | 'STAFF' | 'PROVIDER');
  setEditPassword('');
  setError(null);
  setMessage(null);
};

const cancelEditingUser = () => {
  setEditingUser(null);
  setEditPassword('');
};

const handleEditUser = async (event: React.FormEvent) => {
  event.preventDefault();

  if (!editingUser) return;

  setIsSavingEdit(true);
  setError(null);
  setMessage(null);

  try {
    const token = localStorage.getItem('serine_auth_token');

    if (!token) {
      throw new Error('Authentication token is required');
    }

    const body: Record<string, string> = {
      firstName: editFirstName,
      lastName: editLastName,
      email: editEmail,
      role: editRole,
    };

    if (editPassword.trim()) {
      body.password = editPassword;
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${editingUser.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update user');
    }

    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === result.user.id
          ? { ...currentUser, ...result.user }
          : currentUser
      )
    );

    setMessage('User updated successfully.');
    cancelEditingUser();
  } catch (error) {
    console.error('Failed to update user:', error);
    setError(
      error instanceof Error ? error.message : 'Failed to update user'
    );
  } finally {
    setIsSavingEdit(false);
  }
};

const handleToggleUserStatus = async (
  user: StaffUser
) => {
  try {
    const token = localStorage.getItem(
      'serine_auth_token'
    );

    if (!token) {
      throw new Error(
        'Authentication token is required'
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${user.id}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          active: !user.active,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          'Failed to update user status'
      );
    }

    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === user.id
          ? {
              ...currentUser,
              active: result.user.active,
            }
          : currentUser
      )
    );
  } catch (error) {
    console.error(
      'Failed to update user status:',
      error
    );

    setError(
      error instanceof Error
        ? error.message
        : 'Failed to update user status'
    );
  }
};

useEffect(() => {
  loadUsers();
}, []);

  const handleCreateUser = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessage(null);
    setError(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem(
        'serine_auth_token'
      );

      if (!token) {
        throw new Error(
          'Authentication token is required'
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
            role,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            'Failed to create account'
        );
      }

      setMessage(
        `${role} account created successfully.`
      );

      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setRole('DOCTOR');
    } catch (error) {
      console.error(
        'Create user failed:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to create account'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-[#f7fbfb] px-4 py-12">
      <div className="max-w-3xl mx-auto">

                {/* Admin Navigation */}

        <div className="mb-6 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() => onNavigate?.('appointments')}
            className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
          >
            📅 Appointments
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('staff-management')}
            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            👥 Staff Management
          </button>

          <button
  type="button"
  onClick={() => onNavigate?.('test-management')}
  className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
>
  🧪 Manage Tests
</button>

        </div>

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#168d90]">
            Administration
          </p>

          <h1 className="text-3xl font-extrabold text-[#103d4a] mt-2">
            Staff Management
          </h1>

          <p className="text-sm text-slate-600 mt-2">
            Create secure Staff and Doctor accounts.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Create Staff / Doctor Account
          </h2>

          {message && (
            <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleCreateUser}
            className="space-y-5"
          >

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  First Name
                </label>

                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                  placeholder="First name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Name
                </label>

                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                  placeholder="Last name"
                />
              </div>

            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                placeholder="doctor@serinediagnostics.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Temporary Password
              </label>

              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Role
              </label>

              <select
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value as
                      | 'DOCTOR'
                      | 'STAFF'
                        | 'PROVIDER'
                       
                  )
                }
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[#168d90]"
              >
                <option value="DOCTOR">
                  Doctor
                </option>

                <option value="STAFF">
                  Staff
                </option>

                <option value="PROVIDER">
                   Provider
                </option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white font-bold text-sm transition-colors disabled:opacity-60"
            >
              {isLoading
                ? 'Creating Account...'
                : 'Create Account'}
            </button>

          </form>
        </div>
        {editingUser && (
          <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Edit User</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Update this existing staff, doctor, or provider account.
                </p>
              </div>
              <button
                type="button"
                onClick={cancelEditingUser}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(event) => setEditFirstName(event.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(event) => setEditLastName(event.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                <select
                  value={editRole}
                  onChange={(event) => setEditRole(event.target.value as 'DOCTOR' | 'STAFF' | 'PROVIDER')}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[#168d90]"
                >
                  <option value="DOCTOR">Doctor</option>
                  <option value="STAFF">Staff</option>
                  <option value="PROVIDER">Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New Password (optional)</label>
                <input
                  type="password"
                  minLength={8}
                  value={editPassword}
                  onChange={(event) => setEditPassword(event.target.value)}
                  placeholder="Leave blank to keep the current password"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingEdit}
                className="w-full py-3.5 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white font-bold text-sm transition-colors disabled:opacity-60"
              >
                {isSavingEdit ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

                {/* Existing Users */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Existing Users
          </h2>

          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-sm text-slate-500">
                No users found.
              </p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>

                    <p className="text-sm text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-[#e8f6f4] text-[#168d90] text-xs font-bold">
                      {user.role}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                     <button
                      type="button"
                      onClick={() => startEditingUser(user)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleUserStatus(user)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        user.active
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                     >
                      {user.active ? 'Deactivate' : 'Activate'}
                     </button>

                  </div>
                  
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};