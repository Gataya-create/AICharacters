
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const translations = {
  vi: {
    // Header
    appTitle: 'AI Storyboard Studio',
    // Tabs
    charactersTab: 'Nhân vật',
    backgroundsTab: 'Bối cảnh',
    // Character Creator
    createCharacterTitle: 'Tạo Nhân Vật',
    generateWithAi: 'Tạo Bằng AI',
    uploadImage: 'Tải Ảnh Lên',
    appearanceLabel: 'Ngoại hình',
    appearancePlaceholder: 'ví dụ: cô gái trẻ, tóc nâu gợn sóng, mắt xanh',
    clothingLabel: 'Trang phục',
    clothingPlaceholder: 'ví dụ: váy hè trắng bay bổng',
    accessoriesLabel: 'Phụ kiện',
    accessoriesPlaceholder: 'ví dụ: vòng cổ bạc, kính tròn',
    moodLabel: 'Tâm trạng / Biểu cảm',
    moodPlaceholder: 'ví dụ: mỉm cười ấm áp, tò mò',
    styleLabel: 'Phong Cách',
    generateButton: 'Tạo',
    regenerateButton: 'Tạo Lại',
    uploadLabel: 'Kéo thả tệp, hoặc',
    uploadLink: 'chọn tệp',
    previewAlt: 'Nhân vật được tạo',
    previewPlaceholder: 'Xem Trước',
    characterNamePlaceholder: 'Tên Nhân Vật',
    saveToLibraryButton: 'Lưu vào Thư viện',
    loadingCharacter: 'Đang tạo nhân vật...',
    loadingUpload: 'Đang tải lên...',
    // Errors for Character Creator
    errorAppearanceEmpty: 'Vui lòng nhập mô tả ngoại hình cho nhân vật của bạn.',
    errorCharacterGenerationFailed: 'Tạo nhân vật thất bại. Vui lòng thử lại.',
    errorFileReadFailed: 'Không thể đọc tệp.',
    errorSaveFailed: 'Vui lòng đặt tên và tạo/tải lên một hình ảnh.',
    errorRestyleFailed: 'Tạo kiểu mới cho nhân vật thất bại. Vui lòng thử lại.',
    loadingRestyle: 'Đang áp dụng phong cách...',
    styleWillBeApplied: 'Phong cách được chọn ở trên sẽ được áp dụng cho ảnh tải lên.',
    // Character Library
    libraryTitle: 'Thư viện Nhân vật',
    libraryEmpty: 'Thư viện trống. Hãy tạo nhân vật để bắt đầu!',
    editCharacterNameModalTitle: 'Sửa Tên Nhân vật',
    cancelButton: 'Hủy',
    saveButton: 'Lưu',
    // Background Creator
    createBackgroundTitle: 'Tạo Bối cảnh',
    backgroundDescriptionLabel: 'Mô tả Bối cảnh',
    backgroundDescriptionPlaceholder: 'ví dụ: một khu rừng thần tiên với những cây phát sáng, một thành phố cyberpunk vào ban đêm',
    generateBackgroundButton: 'Tạo Bối cảnh',
    saveBackgroundButton: 'Lưu Bối cảnh',
    loadingBackground: 'Đang tạo bối cảnh...',
    errorBackgroundGenerationFailed: 'Tạo bối cảnh thất bại. Vui lòng thử lại.',
    errorBackgroundSave: 'Vui lòng đặt tên và tạo một hình ảnh bối cảnh.',
    backgroundNamePlaceholder: 'Tên Bối cảnh',
    // Background Library
    backgroundLibraryTitle: 'Thư viện Bối cảnh',
    backgroundLibraryEmpty: 'Thư viện trống. Hãy tạo một bối cảnh!',
    editBackgroundNameModalTitle: 'Sửa Tên Bối cảnh',
    // Import/Export
    importCharactersTitle: 'Nhập nhân vật',
    exportCharactersTitle: 'Xuất nhân vật',
    importBackgroundsTitle: 'Nhập bối cảnh',
    exportBackgroundsTitle: 'Xuất bối cảnh',
    importErrorMessage: 'Nhập thất bại. Vui lòng kiểm tra tệp JSON có hợp lệ không.',
    fileReadError: 'Lỗi đọc tệp.',
    // Scene Composer
    composeSceneTitle: 'Kết hợp Cảnh',
    selectedCharactersLabel: 'Nhân vật đã chọn',
    selectedCharactersPlaceholder: 'Chọn nhân vật từ thư viện của bạn.',
    selectedBackgroundLabel: 'Bối cảnh đã chọn',
    selectedBackgroundPlaceholder: 'Chọn bối cảnh từ thư viện.',
    sceneDescriptionLabel: 'Mô tả Hành động / Chi tiết',
    sceneDescriptionPlaceholder: 'ví dụ: Nhân vật A đang nói chuyện với Nhân vật B bên một đống lửa trại.',
    aspectRatioLabel: 'Tỉ lệ Khung hình',
    generateSceneButton: 'Kết hợp Cảnh',
    generatingScene: 'Đang tạo Cảnh...',
    sceneIdeasTitle: 'Gợi ý Hành động',
    sceneIdea1: 'đang đi dạo cùng nhau',
    sceneIdea2: 'đang trò chuyện sôi nổi',
    sceneIdea3: 'nhìn về phía hoàng hôn',
    sceneIdea4: 'khám phá một vật thể bí ẩn',
    // Errors for Scene Composer
    errorComposeFailed: 'Vui lòng chọn nhân vật, bối cảnh và mô tả hành động.',
    errorSceneGenerationFailed: 'Tạo cảnh thất bại. Vui lòng thử lại.',
    // Result Viewer
    resultTitle: 'Kết quả',
    resultPlaceholder: 'Cảnh của bạn sẽ xuất hiện ở đây.',
    generatingSceneResult: 'Đang tạo cảnh...',
    aiEditButton: 'Chỉnh sửa AI',
    downloadButton: 'Tải xuống',
    // AI Edit Modal
    aiEditModalTitle: 'Chỉnh sửa AI Nâng cao',
    aiEditModalDescription: 'Vẽ mặt nạ lên vùng bạn muốn thay đổi, sau đó mô tả chỉnh sửa của bạn.',
    aiEditModalPlaceholder: 'ví dụ: đổi màu áo thành xanh dương, thêm một chiếc mũ',
    applyButton: 'Áp dụng',
    errorImageEditFailed: 'Chỉnh sửa ảnh thất bại. Vui lòng thử lại.',
    brushSizeLabel: 'Kích thước Cọ',
    drawButton: 'Vẽ',
    eraseButton: 'Tẩy',
    clearMaskButton: 'Xóa Mặt nạ',
    // Variations
    variationButtonTooltip: 'Tạo biến thể',
    variationsModalTitle: 'Biến thể cho "{characterName}"',
    generatingVariations: 'Đang tạo biến thể...',
    saveSelectedButton: 'Lưu Lựa chọn',
    noVariationsGenerated: 'Không thể tạo biến thể. Vui lòng thử lại.',
  },
  en: {
    // Header
    appTitle: 'AI Storyboard Studio',
    // Tabs
    charactersTab: 'Characters',
    backgroundsTab: 'Backgrounds',
    // Character Creator
    createCharacterTitle: 'Create Character',
    generateWithAi: 'Generate with AI',
    uploadImage: 'Upload Image',
    appearanceLabel: 'Appearance',
    appearancePlaceholder: 'e.g., young woman, wavy brown hair, blue eyes',
    clothingLabel: 'Clothing',
    clothingPlaceholder: 'e.g., a flowing white summer dress',
    accessoriesLabel: 'Accessories',
    accessoriesPlaceholder: 'e.g., silver necklace, round glasses',
    moodLabel: 'Mood / Expression',
    moodPlaceholder: 'e.g., smiling warmly, looking curious',
    styleLabel: 'Style',
    generateButton: 'Generate',
    regenerateButton: 'Regenerate',
    uploadLabel: 'Drag & drop a file, or',
    uploadLink: 'browse',
    previewAlt: 'Generated Character',
    previewPlaceholder: 'Preview',
    characterNamePlaceholder: 'Character Name',
    saveToLibraryButton: 'Save to Library',
    loadingCharacter: 'Generating character...',
    loadingUpload: 'Uploading...',
    // Errors for Character Creator
    errorAppearanceEmpty: 'Please enter an appearance description for your character.',
    errorCharacterGenerationFailed: 'Character generation failed. Please try again.',
    errorFileReadFailed: 'Could not read the file.',
    errorSaveFailed: 'Please name and generate/upload an image.',
    errorRestyleFailed: 'Character restyling failed. Please try again.',
    loadingRestyle: 'Applying style...',
    styleWillBeApplied: 'The selected style above will be applied to the uploaded image.',
    // Character Library
    libraryTitle: 'Character Library',
    libraryEmpty: 'Library is empty. Create a character to get started!',
    editCharacterNameModalTitle: 'Edit Character Name',
    cancelButton: 'Cancel',
    saveButton: 'Save',
    // Background Creator
    createBackgroundTitle: 'Create Background',
    backgroundDescriptionLabel: 'Background Description',
    backgroundDescriptionPlaceholder: 'e.g., an enchanted forest with glowing trees, a cyberpunk city at night',
    generateBackgroundButton: 'Generate Background',
    saveBackgroundButton: 'Save Background',
    loadingBackground: 'Generating background...',
    errorBackgroundGenerationFailed: 'Background generation failed. Please try again.',
    errorBackgroundSave: 'Please name and generate a background image.',
    backgroundNamePlaceholder: 'Background Name',
    // Background Library
    backgroundLibraryTitle: 'Background Library',
    backgroundLibraryEmpty: 'Library is empty. Create a background!',
    editBackgroundNameModalTitle: 'Edit Background Name',
    // Import/Export
    importCharactersTitle: 'Import Characters',
    exportCharactersTitle: 'Export Characters',
    importBackgroundsTitle: 'Import Backgrounds',
    exportBackgroundsTitle: 'Export Backgrounds',
    importErrorMessage: 'Import failed. Please check if the JSON file is valid.',
    fileReadError: 'Error reading file.',
    // Scene Composer
    composeSceneTitle: 'Compose Scene',
    selectedCharactersLabel: 'Selected Characters',
    selectedCharactersPlaceholder: 'Select characters from your library.',
    selectedBackgroundLabel: 'Selected Background',
    selectedBackgroundPlaceholder: 'Select a background from its library.',
    sceneDescriptionLabel: 'Action / Scene Details',
    sceneDescriptionPlaceholder: 'e.g., Character A is talking to Character B by a campfire.',
    aspectRatioLabel: 'Aspect Ratio',
    generateSceneButton: 'Generate Scene',
    generatingScene: 'Generating Scene...',
    sceneIdeasTitle: 'Action Ideas',
    sceneIdea1: 'walking together',
    sceneIdea2: 'having an intense conversation',
    sceneIdea3: 'looking towards the sunset',
    sceneIdea4: 'discovering a mysterious object',
    // Errors for Scene Composer
    errorComposeFailed: 'Please select character(s), a background, and describe the scene.',
    errorSceneGenerationFailed: 'Scene generation failed. Please try again.',
    // Result Viewer
    resultTitle: 'Result',
    resultPlaceholder: 'Your scene will appear here.',
    generatingSceneResult: 'Generating scene...',
    aiEditButton: 'AI Edit',
    downloadButton: 'Download',
    // AI Edit Modal
    aiEditModalTitle: 'Advanced AI Edit',
    aiEditModalDescription: 'Draw a mask over the area you want to change, then describe your edit.',
    aiEditModalPlaceholder: 'e.g., change the shirt color to blue, add a hat',
    applyButton: 'Apply',
    errorImageEditFailed: 'Image editing failed. Please try again.',
    brushSizeLabel: 'Brush Size',
    drawButton: 'Draw',
    eraseButton: 'Erase',
    clearMaskButton: 'Clear Mask',
    // Variations
    variationButtonTooltip: 'Generate variations',
    variationsModalTitle: 'Variations for "{characterName}"',
    generatingVariations: 'Generating variations...',
    saveSelectedButton: 'Save Selected',
    noVariationsGenerated: 'Could not generate variations. Please try again.',
  }
};

export const useTranslation = () => {
    const { locale, setLocale } = useContext(LanguageContext);

    const t = (key: keyof typeof translations.vi) => {
        return translations[locale]?.[key] || translations['en'][key] || key;
    };

    return { t, setLocale, locale };
}
