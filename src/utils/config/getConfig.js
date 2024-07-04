
export const getConfig = (appName) => {
  const configs = {
    [process.env.EXPO_PUBLIC_APP_NAME_UAE]: {
      appName: process.env.EXPO_PUBLIC_APP_NAME_UAE,
      packageName: process.env.EXPO_PUBLIC_PACKAGE_NAME_UAE,
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID_UAE,
    },
    [process.env.EXPO_PUBLIC_APP_NAME_OMAN]: {
      appName: process.env.EXPO_PUBLIC_APP_NAME_OMAN,
      packageName: process.env.EXPO_PUBLIC_PACKAGE_NAME_OMAN,
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID_OMAN,
    },
  };

  return configs[appName] || {};
};
