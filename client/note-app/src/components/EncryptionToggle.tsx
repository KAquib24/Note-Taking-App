// src/components/EncryptionToggle.tsx
interface EncryptionToggleProps {
  isEncrypted: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const EncryptionToggle = ({ isEncrypted, onToggle, disabled = false }: EncryptionToggleProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Encrypt Note:</span>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isEncrypted ? 'bg-blue-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isEncrypted ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm text-gray-500">
        {isEncrypted ? 'On' : 'Off'}
      </span>
      {isEncrypted && (
        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
          🔒 Encrypted
        </span>
      )}
    </div>
  );
};

export default EncryptionToggle;