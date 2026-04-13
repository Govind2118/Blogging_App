import { Add16Regular } from '@fluentui/react-icons';
import { PRESSABLE_BTN } from './constants';

const AddElementMenu = ({ showOptions, optionsRef, onToggle, onAddElement }) => {
  return (
    <div className="fixed bottom-5 right-4 sm:right-5">
      <button
        className={`box-border flex flex-row items-center justify-center gap-2 rounded-full border border-[rgba(0,0,0,0.1)] bg-white px-6 py-3 shadow-sm ${PRESSABLE_BTN}`}
        onClick={onToggle}
      >
        <span className="whitespace-nowrap text-[16px] font-normal font-geist-variable text-[#333333]">
          Add element
        </span>
        <Add16Regular className="h-[20px] w-[20px]" />
      </button>

      {showOptions && (
        <div ref={optionsRef} className="fixed bottom-20 right-4 sm:right-5">
          <div
            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
            onClick={() => onAddElement('sub-heading')}
          >
            Sub-heading
          </div>
          <div
            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
            onClick={() => onAddElement('paragraph')}
          >
            Paragraph
          </div>
          <div
            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
            onClick={() => onAddElement('divider')}
          >
            Divider
          </div>
        </div>
      )}
    </div>
  );
};

export default AddElementMenu;
