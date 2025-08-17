import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  Key,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordTab = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm<PasswordFormData>({
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  // Watch the new password for strength calculation
  const newPassword = watch('newPassword')
  const confirmPassword = watch('confirmPassword')

  const [passwordStrength, setPasswordStrength] = useState(0)

  const checkPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  // Update password strength when new password changes
  React.useEffect(() => {
    setPasswordStrength(checkPasswordStrength(newPassword || ''))
  }, [newPassword])

  const onSubmit = (data: PasswordFormData) => {
    console.log('Password change data:', data);
    // Here you would typically make an API call to update the password
    // For now, just reset the form
    reset();
  }

  const handleCancel = () => {
    reset();
  }

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500'
      case 2:
        return 'bg-yellow-500'
      case 3:
        return 'bg-blue-500'
      case 4:
      case 5:
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return 'Very Weak'
      case 2:
        return 'Weak'
      case 3:
        return 'Fair'
      case 4:
        return 'Good'
      case 5:
        return 'Strong'
      default:
        return ''
    }
  }

  const passwordRequirements = [
    { text: 'At least 8 characters', met: (newPassword || '').length >= 8 },
    { text: 'One lowercase letter', met: /[a-z]/.test(newPassword || '') },
    { text: 'One uppercase letter', met: /[A-Z]/.test(newPassword || '') },
    { text: 'One number', met: /[0-9]/.test(newPassword || '') },
    { text: 'One special character', met: /[^A-Za-z0-9]/.test(newPassword || '') }
  ]

  // Validation rules
  const passwordValidation = {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters'
    },
    validate: {
      hasLower: (value: string) => /[a-z]/.test(value) || 'Must contain lowercase letter',
      hasUpper: (value: string) => /[A-Z]/.test(value) || 'Must contain uppercase letter',
      hasNumber: (value: string) => /[0-9]/.test(value) || 'Must contain number',
      hasSpecial: (value: string) => /[^A-Za-z0-9]/.test(value) || 'Must contain special character'
    }
  }

  return (
    <div className="min-h-[130vh]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Change Password</h2>
        <p className="text-gray-400 mt-1">Update your password to keep your account secure</p>
      </div>

      {/* Security Status */}
      <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Account Security</h3>
            <p className="text-green-400 text-sm">Your account is secure</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-[#18181b] rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Lock className="w-5 h-5 text-[#ff8800]" />
              <span className="text-white font-medium">Password</span>
            </div>
            <p className="text-gray-400 text-sm">Last changed 3 months ago</p>
          </div>
          
          <div className="bg-[#18181b] rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">2FA</span>
            </div>
            <p className="text-gray-400 text-sm">Not enabled</p>
          </div>
          
          <div className="bg-[#18181b] rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Login Sessions</span>
            </div>
            <p className="text-gray-400 text-sm">2 active sessions</p>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-6">Update Password</h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                {...register('currentPassword', { required: 'Current password is required' })}
                className="w-full bg-[#18181b] border border-[#232326] rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800]"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-3 text-gray-400 hover:text-white"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-400">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword', passwordValidation)}
                className="w-full bg-[#18181b] border border-[#232326] rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800]"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-3 text-gray-400 hover:text-white"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-400">{errors.newPassword.message}</p>
            )}
            
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Password Strength:</span>
                  <span className={`text-sm font-medium ${passwordStrength >= 4 ? 'text-green-400' : passwordStrength >= 3 ? 'text-blue-400' : passwordStrength >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {getStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === newPassword || 'Passwords do not match'
                })}
                className="w-full bg-[#18181b] border border-[#232326] rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800]"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
            )}
            
            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-2 flex items-center space-x-2">
                {newPassword === confirmPassword ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">Passwords don't match</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Password Requirements */}
          {newPassword && (
            <div className="bg-[#18181b] rounded-xl p-4">
              <h4 className="text-white font-medium mb-3">Password Requirements</h4>
              <div className="space-y-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {req.met ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-600"></div>
                    )}
                    <span className={`text-sm ${req.met ? 'text-green-400' : 'text-gray-400'}`}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isValid || passwordStrength < 3}
            >
              Update Password
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-[#232326] text-white rounded-xl hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Security Tips */}
      <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Security Tips</h3>
        <div className="space-y-3 text-gray-400">
          <div className="flex items-start space-x-2">
            <Shield className="w-5 h-5 text-[#ff8800] mt-0.5" />
            <p>Use a unique password that you don't use for other accounts</p>
          </div>
          <div className="flex items-start space-x-2">
            <Lock className="w-5 h-5 text-[#ff8800] mt-0.5" />
            <p>Choose a password that's at least 8 characters long with a mix of letters, numbers, and symbols</p>
          </div>
          <div className="flex items-start space-x-2">
            <Key className="w-5 h-5 text-[#ff8800] mt-0.5" />
            <p>Consider enabling two-factor authentication for additional security</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasswordTab
