export type RootStacksParamList = {
  HomeTabs: {
    screen: "Map" | "Search" | "Community" | "Profile";
  };
  SignIn: undefined;
  SignUp: undefined;
  Demo2: { user: string };
  NotFound: undefined;
  Setting: undefined;
  EditProfile: undefined;
  Test: undefined;
  LocationDetail: {
    locationId: string;
  };
  LocationReviews: {
    locationId: string;
  };
  LocationUserReviews: {
    locationId: string;
  };
  LocationReviewsByType: {
    locationId: string;
    featureId: string;
    type: string;
  };
  CreateObstacle: undefined;
  CreateRoute: undefined;
  CreatePost: undefined;
  CommunityDetail: {
    communityId: string;
  };
  PostDetail: {
    communityId: string;
  };
  LocationAddImage: {
    locationId: string;
    featureId: string;
  };
  RouteDetail: {
    routeId: string;
  };
  RouteScreen: undefined;
  EditRoute: {
    routeId: string;
  };
  PostScreen: undefined;
  EditPost: {
    postId: string;
  };
  ForgotPassword: {
    email: string;
  };
  ResetSuccess: undefined;
  SearchRoute: undefined
  SearchLocation: undefined;
  SearchLocationDetail: {
    locationId: string;
  };
  SearchObstacle: undefined;
  ObstacleDetail: {
    obstacleId: string;
  };
  ImagePreview: {
    initialIndex: number;
  };
};
