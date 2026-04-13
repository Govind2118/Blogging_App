import { PRESSABLE_BTN } from './constants';

const DeleteConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-md bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold font-geist-variable">Are you sure you want to remove this element?</h2>
        <p className="mb-6 text-gray-600">All the contents of the selected element will be deleted.</p>

        <div className="flex justify-center pb-2">
          <button
            onClick={onConfirm}
            className={`w-full rounded-md bg-[#86005E] py-2 text-white ${PRESSABLE_BTN}`}
          >
            Yes, remove element
          </button>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className={`w-full rounded-md bg-gray-200 py-2 ${PRESSABLE_BTN}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
