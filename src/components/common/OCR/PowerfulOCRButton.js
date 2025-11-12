

const PowerfulOCRButton = ({ onTextExtracted, style }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const openCameraForScanning = async () => {
    try {
      // Request camera permission
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      
      if (cameraPermission.status !== 'granted') {
        Alert.alert('Camera Permission Required', 'Please allow camera access to scan business cards and extract text');
        return;
      }

      // Launch camera with optimized settings for OCR
      const cameraResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Reduced from 1.0 to prevent memory issues
        exif: false,
        base64: false, // Disable base64 to save memory
      });

      if (!cameraResult.canceled) {
        setIsProcessing(true);
        
        try {
          console.log('🔍 Starting OCR processing...');
          
          // Extract text using POWERFUL Google ML Kit OCR
          const extractedData = await PowerfulOCR.extractTextFromImage(cameraResult.assets[0].uri);
          
          console.log('✅ OCR completed successfully');
          
          // Validate data quality
          const quality = PowerfulOCR.validateExtractedData(extractedData);
          console.log('📊 OCR Quality Score:', quality.score, '%');
          
          if (extractedData && Object.keys(extractedData).length > 0) {
            // Force garbage collection after OCR
            if (global.gc) {
              global.gc();
              console.log('🗑️ Forced garbage collection after OCR');
            }
            
            // Use setTimeout to ensure UI is ready before callback
            setTimeout(() => {
              // Use InteractionManager to ensure React Native is ready for navigation/state changes
              InteractionManager.runAfterInteractions(() => {
                try {
                  onTextExtracted(extractedData);
                  console.log('✅ OCR callback completed successfully');
                } catch (callbackError) {
                  console.error('❌ Error in OCR callback:', callbackError);
                }
              });
            }, 100);
            
            if (quality.score >= 75) {
              Alert.alert('Excellent! 🎉', 'High-quality customer information extracted and filled automatically');
            } else if (quality.score >= 50) {
              Alert.alert('Good! ✅', 'Customer information extracted. Please review and complete missing details.');
            } else {
              Alert.alert('Partial Success 📝', 'Some information extracted. Please review and complete the form.');
            }
          } else {
            Alert.alert('No Text Found', 'Could not extract readable text. Please ensure the business card is well-lit and clearly visible.');
          }
        } catch (ocrError) {
          console.error('❌ OCR Processing Error:', ocrError);
          
          // Clean up on error too
          if (global.gc) {
            global.gc();
            console.log('🗑️ Forced garbage collection after OCR error');
          }
          
          Alert.alert('OCR Error', 'Failed to process the image. Please try again with better lighting.');
        }
      }
    } catch (error) {
      console.error('Camera OCR Error:', error);
      Alert.alert('Camera Error', 'Failed to access camera. Please check permissions and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectImageFromGallery = async () => {
    try {
      // Request media library permission
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (libraryPermission.status !== 'granted') {
        Alert.alert('Gallery Permission Required', 'Please allow gallery access to select business card images');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1.0,
      });

      if (!result.canceled) {
        setIsProcessing(true);
        
        try {
          // Extract text using POWERFUL Google ML Kit OCR
          const extractedData = await PowerfulOCR.extractTextFromImage(result.assets[0].uri);
          
          // Force garbage collection after OCR
          if (global.gc) {
            global.gc();
            console.log('🗑️ Forced garbage collection after gallery OCR');
          }
          
          if (extractedData && Object.keys(extractedData).length > 0) {
            // Add delay to ensure UI is ready
            setTimeout(() => {
              // Use InteractionManager to ensure React Native is ready for navigation/state changes
              InteractionManager.runAfterInteractions(() => {
                try {
                  onTextExtracted(extractedData);
                  console.log('✅ Gallery OCR callback completed successfully');
                } catch (callbackError) {
                  console.error('❌ Error in gallery OCR callback:', callbackError);
                }
              });
            }, 100);
            Alert.alert('Success! 🎉', 'Customer information extracted from gallery image');
          } else {
            Alert.alert('No Text Found', 'Could not extract readable text from the selected image.');
          }
        } catch (ocrError) {
          console.error('Gallery OCR Error:', ocrError);
          
          // Clean up on error too
          if (global.gc) {
            global.gc();
            console.log('🗑️ Forced garbage collection after gallery OCR error');
          }
          
          Alert.alert('Processing Error', 'Failed to process the selected image.');
        }
      }
    } catch (error) {
      console.error('Gallery Error:', error);
      Alert.alert('Gallery Error', 'Failed to access gallery.');
    } finally {
      setIsProcessing(false);
    }
  };

  const showOCROptions = () => {
    Alert.alert(
      '📸 Scan Business Card',
      'Choose how to capture the business card for text extraction',
      [
        { text: '📸 Take Photo', onPress: openCameraForScanning },
        { text: '🖼️ Choose from Gallery', onPress: selectImageFromGallery },
        { text: '❌ Cancel', style: 'cancel' }
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={{ marginVertical: 10 }}>
      {/* Main OCR Button */}
      <TouchableOpacity
        style={[{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.primaryThemeColor,
          padding: 16,
          borderRadius: 12,
          elevation: 3,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
        }, style]}
        onPress={showOCROptions}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Ionicons name="scan-outline" size={26} color={COLORS.white} />
        )}
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{
            fontFamily: FONT_FAMILY.urbanistBold,
            color: COLORS.white,
            fontSize: 16
          }}>
            {isProcessing ? 'Processing Business Card...' : 'Scan Business Card'}
          </Text>
          <Text style={{
            fontFamily: FONT_FAMILY.urbanistMedium,
            color: COLORS.white,
            fontSize: 12,
            opacity: 0.9,
            marginTop: 2
          }}>
            Powered by Google ML Kit
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={COLORS.white} />
      </TouchableOpacity>

      {/* Processing Indicator */}
      {isProcessing && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 12,
          padding: 8,
          backgroundColor: COLORS.lightGrey || '#F3F4F6',
          borderRadius: 8
        }}>
          <ActivityIndicator size="small" color={COLORS.primaryThemeColor} />
          <Text style={{
            marginLeft: 8,
            fontFamily: FONT_FAMILY.urbanistMedium,
            color: COLORS.darkGrey || '#6B7280',
            fontSize: 14
          }}>
            Extracting text with AI...
          </Text>
        </View>
      )}
    </View>
  );
};

export default PowerfulOCRButton;