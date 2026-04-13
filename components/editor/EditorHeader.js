import { ChevronLeft24Regular } from '@fluentui/react-icons';
import { ClipLoader } from 'react-spinners';
import { PRESSABLE_BTN } from './constants';

const EditorHeader = ({ isSaving, saveButtonLabel, onBack, onSave }) => {
  return (
    <div className="sticky top-0 z-20 w-full border-b border-black/[0.06] bg-[#F4F4F4]">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-6">
        <div className="flex flex-row items-center gap-3">
          <ChevronLeft24Regular
            className="h-6 w-6 cursor-pointer transition-opacity hover:opacity-70"
            onClick={onBack}
          />
          <span className="text-2xl font-geist-variable">Blog Editor</span>
        </div>

        <div className="flex flex-row items-center justify-end gap-3">
          <button
            type="button"
            className={`flex flex-row items-center justify-center rounded-md bg-white px-6 py-3 ${PRESSABLE_BTN}`}
          >
            <span className="text-sm font-geist-variable text-[#333333]">Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            className={`flex min-w-[148px] flex-row items-center justify-center gap-2 rounded-md bg-[#86005E] px-5 py-3 disabled:cursor-wait disabled:opacity-90 ${PRESSABLE_BTN}`}
            onClick={onSave}
          >
            {isSaving ? (
              <ClipLoader size={20} color="#ffffff" />
            ) : (
              <span className="text-sm font-geist-variable text-white">{saveButtonLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorHeader;
