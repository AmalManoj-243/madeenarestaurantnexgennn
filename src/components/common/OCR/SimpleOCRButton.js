

const SimpleOCRButton = ({ onTextExtracted, style }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const openCameraForScanning = async () => {
    try {
      // Request camera permission
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      
      if (cameraPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access to scan documents');
        return;
      }

      // Launch camera
      const cameraResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!cameraResult.canceled) {
        setIsProcessing(true);
        
        // Extract customer details using simple text extraction
        const extractedData = await SimpleTextExtractor.extractCustomerDetails(cameraResult.assets[0].uri);
        
        if (extractedData && Object.keys(extractedData).length > 0) {
          onTextExtracted(extractedData);
          Alert.alert('Success!', 'Customer information extracted and filled automatically');
        } else {
          Alert.alert('No Data Found', 'Could not extract customer information.');
        }
      }
    } catch (error) {
      console.error('Simple OCR Error:', error);
      Alert.alert('Error', 'Failed to process document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateRandomCustomer = () => {
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      const randomData = SimpleTextExtractor.extractCustomerDetails();
      onTextExtracted(randomData);
      Alert.alert('Success!', 'Sample customer information generated');
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <View style={{ marginVertical: 10 }}>
      {/* Camera Scan Button */}
      <TouchableOpacity
        style={[{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.primaryThemeColor,
          padding: 15,
          borderRadius: 10,
          marginBottom: 10,
          elevation: 2,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }, style]}
        onPress={openCameraForScanning}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Ionicons name="camera-outline" size={24} color={COLORS.white} />
        )}
        <Text style={{
          marginLeft: 12,
          fontFamily: FONT_FAMILY.urbanistBold,
          color: COLORS.white,
          fontSize: 16
        }}>
          {isProcessing ? 'Processing...' : 'Scan Business Card'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.white} style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      {/* Demo Data Button */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.secondaryColor || '#6B7280',
          padding: 15,
          borderRadius: 10,
          elevation: 2,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
        onPress={generateRandomCustomer}
        disabled={isProcessing}
      >
        <Ionicons name="document-text-outline" size={24} color={COLORS.white} />
        <Text style={{
          marginLeft: 12,
          fontFamily: FONT_FAMILY.urbanistBold,
          color: COLORS.white,
          fontSize: 16
        }}>
          Generate Sample Data
        </Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.white} style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>
    </View>
  );
};

export default SimpleOCRButton;