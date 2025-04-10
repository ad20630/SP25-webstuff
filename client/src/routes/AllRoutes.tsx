import { RouteObject, Navigate } from "react-router-dom";
import ImageGallery from "components/Sidebar/ImageGallery";
import Home from 'components/pages/Home';
import AppPage from 'components/pages/app/AppPage';

interface User {
  username: string;
  token: string;
}

export const AllRoutes = (user: User | null, handleLogin: (username: string, token: string) => void, handleLogout: () => void): RouteObject[] => [
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/gallery",
    element: <ImageGallery onSelect={(url) => console.log("Selected image URL:", url)} />
  },
  {
    path: "/app",
    children: [
      {
        path: "editor",
        element: user ? <AppPage /> : <Navigate to="/login" />
      }
    ]
  }
];
