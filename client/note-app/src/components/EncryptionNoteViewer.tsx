import { useState, useEffect } from 'react';
import PasswordModal from './PasswordModel';
import { decryptText, isEncryptedContent, getEncryptionKey, storeEncryptionKey } from '../lib/crypto';

interface EncryptedNoteViewerProps {
  note: {
    _id: string;
    title: string;
    content: string;
    isEncrypted?: boolean;
  };
  children: (decryptedContent: string) => React.ReactNode;
}

const EncryptionNoteViewer = ({ note, children }: EncryptedNoteViewerProps) => {
  const [decryptedContent, setDecryptedContent] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    const checkEncryption = async () => {
      if (note.isEncrypted || isEncryptedContent(note.content)) {
        // Check if we have the key stored
        const storedKey = getEncryptionKey(note._id);
        if (storedKey) {
          try {
            const decrypted = decryptText(note.content, storedKey);
            setDecryptedContent(decrypted);
          } catch {
            // Stored key is wrong, show password modal
            setShowPasswordModal(true);
          }
        } else {
          // No stored key, show password modal
          setShowPasswordModal(true);
        }
      } else {
        // Note is not encrypted
        setDecryptedContent(note.content);
      }
    };

    checkEncryption();
  }, [note]);

  const handlePasswordConfirm = async (password: string) => {
    setIsDecrypting(true);
    try {
      const decrypted = decryptText(note.content, password);
      setDecryptedContent(decrypted);
      setShowPasswordModal(false);
      
      // Store the key for future use
      storeEncryptionKey(note._id, password);
    } catch (error: any) {
      alert('Failed to decrypt: ' + error.message);
    } finally {
      setIsDecrypting(false);
    }
  };

  if (showPasswordModal) {
    return (
      <>
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onConfirm={handlePasswordConfirm}
          noteTitle={note.title}
        />
        <div className="p-4 text-center">
          <p>Note is encrypted. Please enter password to view.</p>
          {isDecrypting && <p>Decrypting...</p>}
        </div>
      </>
    );
  }

  if (!decryptedContent && (note.isEncrypted || isEncryptedContent(note.content))) {
    return <div className="p-4 text-center">Decrypting...</div>;
  }

  return <>{children(decryptedContent)}</>;
};

export default EncryptionNoteViewer;