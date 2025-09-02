import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth.jsx";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { API_ENDPOINTS } from "@/config/api.config.js";
import { LogOut, User, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Logo = () => (
  <svg
    width="40"
    height="34"
    viewBox="0 0 40 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-10 h-[34px]"
  >
    <path
      d="M2.84994 32.7601C2.10337 32.7601 1.49635 32.5854 1.01492 32.2359V31.4041C1.21028 31.5789 1.47542 31.7257 1.80335 31.8515C2.13826 31.9773 2.47317 32.0402 2.80808 32.0402C3.44999 32.0402 3.9384 31.7676 3.9384 31.3133C3.9384 31.1175 3.84072 30.9638 3.7221 30.8589C3.66628 30.81 3.58256 30.7611 3.47092 30.7121C3.24765 30.6073 3.11508 30.5723 2.8011 30.4815L2.70342 30.4535C2.43131 30.3766 2.21501 30.3067 2.06849 30.2508C1.92197 30.1949 1.76149 30.111 1.58008 30.0061C1.22424 29.7825 1.07771 29.4679 1.07771 29.0206C1.07771 28.2098 1.75451 27.6855 2.84994 27.6855C3.43603 27.6855 3.95933 27.8183 4.41285 28.0909V28.8598C3.91747 28.5593 3.40115 28.4055 2.8639 28.4055C2.19408 28.4055 1.86615 28.6641 1.86615 29.0276C1.86615 29.2373 1.98476 29.3491 2.15222 29.4679C2.24292 29.5239 2.46619 29.5938 2.58481 29.6427L3.14299 29.8034C3.51278 29.9153 3.72908 29.9992 4.03608 30.1669C4.46867 30.3976 4.69892 30.7471 4.72683 31.2993C4.72683 31.7536 4.54542 32.1101 4.18958 32.3687C3.83374 32.6273 3.38719 32.7601 2.84994 32.7601Z"
      fill="#B50102"
    />
    <path
      d="M9.26822 32.6693H5.70283V27.7764H9.17751V28.4824H6.47033V29.7056H8.67515V30.4116H6.47033V31.9633H9.26822V32.6693Z"
      fill="#B50102"
    />
    <path
      d="M11.1729 31.5229C11.5008 31.8654 11.9055 32.0402 12.3869 32.0402C12.8683 32.0402 13.273 31.8654 13.6009 31.5229C13.9289 31.1735 14.0963 30.7401 14.0963 30.2228C14.0963 29.7056 13.9289 29.2722 13.6009 28.9297C13.273 28.5802 12.8683 28.4055 12.3869 28.4055C11.9055 28.4055 11.5008 28.5802 11.1729 28.9297C10.8449 29.2722 10.6844 29.7056 10.6844 30.2228C10.6844 30.7401 10.8449 31.1735 11.1729 31.5229ZM14.1731 32.0332C13.6986 32.5155 13.1056 32.7601 12.3869 32.7601C11.6682 32.7601 11.0752 32.5155 10.6007 32.0332C10.1332 31.5439 9.89601 30.9428 9.89601 30.2228C9.89601 29.5029 10.1332 28.9018 10.6007 28.4195C11.0752 27.9302 11.6682 27.6855 12.3869 27.6855C13.1056 27.6855 13.6986 27.9302 14.1731 28.4195C14.6475 28.9018 14.8848 29.5029 14.8848 30.2228C14.8848 30.9428 14.6475 31.5439 14.1731 32.0332Z"
      fill="#B50102"
    />
    <path
      d="M20.1012 32.7601C19.3825 32.7601 18.7755 32.5225 18.2871 32.0472C17.8057 31.5649 17.5615 30.9568 17.5615 30.2228C17.5615 29.4889 17.8057 28.8808 18.2941 28.4055C18.7825 27.9232 19.3965 27.6855 20.1291 27.6855C20.7222 27.6855 21.2245 27.8253 21.6362 28.1049V28.8668C21.1897 28.5593 20.7012 28.4055 20.178 28.4055C19.6477 28.4055 19.2081 28.5732 18.8662 28.9157C18.5243 29.2582 18.3499 29.6916 18.3499 30.2298C18.3499 30.768 18.5174 31.2084 18.8523 31.5439C19.1942 31.8724 19.6058 32.0402 20.1012 32.0402C20.5966 32.0402 20.9943 31.9004 21.2804 31.6278V29.8454H22.0479V31.9423C21.6502 32.4176 20.9175 32.7601 20.1012 32.7601Z"
      fill="#B50102"
    />
    <path
      d="M23.0764 30.6003V27.7764H23.8439V30.6282C23.8439 31.5439 24.3463 32.0402 25.1208 32.0402C25.8952 32.0402 26.4046 31.5439 26.4046 30.6282V27.7764H27.1721V30.6003C27.1721 31.2853 26.9837 31.8165 26.5999 32.194C26.2162 32.5714 25.7278 32.7601 25.1208 32.7601C24.5137 32.7601 24.0253 32.5714 23.6416 32.201C23.2648 31.8235 23.0764 31.2923 23.0764 30.6003Z"
      fill="#B50102"
    />
    <path d="M29.12 32.6693H28.3525V27.7764H29.12V32.6693Z" fill="#B50102" />
    <path
      d="M33.7454 32.6693H30.3754V27.7764H31.1499V31.9633H33.7454V32.6693Z"
      fill="#B50102"
    />
    <path
      d="M36.2824 32.6693H34.559V27.7764H36.2824C37.0709 27.7764 37.7058 28.0071 38.2012 28.4614C38.6966 28.9157 38.9478 29.5029 38.9478 30.2228C38.9478 30.9428 38.6966 31.5369 38.2012 31.9913C37.7058 32.4456 37.0709 32.6693 36.2824 32.6693ZM35.3265 28.4824V31.9633H36.2127C36.8197 31.9633 37.3011 31.8095 37.643 31.495C37.9849 31.1804 38.1593 30.7611 38.1593 30.2228C38.1593 29.6846 37.9849 29.2652 37.643 28.9507C37.3011 28.6361 36.8197 28.4824 36.2127 28.4824H35.3265Z"
      fill="#B50102"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.995453 3.55225C0.995453 2.28031 2.02656 1.24921 3.2985 1.24921H17.1168C18.3887 1.24921 19.4198 2.28031 19.4198 3.55225C19.4198 4.82419 18.3887 5.8553 17.1168 5.8553H3.2985C2.02656 5.8553 0.995453 4.82419 0.995453 3.55225ZM20.5645 3.55225C20.5645 2.28031 21.5956 1.24921 22.8675 1.24921H36.6858C37.9577 1.24921 38.9888 2.28031 38.9888 3.55225C38.9888 4.82419 37.9577 5.8553 36.6858 5.8553H22.8675C21.5956 5.8553 20.5645 4.82419 20.5645 3.55225ZM0.995453 12.7644C0.995453 11.4925 2.02656 10.4614 3.2985 10.4614H12.5107C16.3265 10.4614 19.4198 13.5547 19.4198 17.3705C19.4198 21.1863 16.3265 24.2797 12.5107 24.2797H3.2985C2.02656 24.2797 0.995453 23.2485 0.995453 21.9766C0.995453 20.7047 2.02656 19.6736 3.2985 19.6736H12.5107C13.7826 19.6736 14.8137 18.6425 14.8137 17.3705C14.8137 16.0986 13.7826 15.0675 12.5107 15.0675H3.2985C2.02656 15.0675 0.995453 14.0364 0.995453 12.7644ZM27.4736 12.7644C27.4736 11.4925 28.5047 10.4614 29.7767 10.4614H36.4587C37.8561 10.4614 38.9888 11.5942 38.9888 12.9915V17.3705C38.9888 21.1863 35.8955 24.2797 32.0797 24.2797H22.8675C21.5956 24.2797 20.5645 23.2485 20.5645 21.9766C20.5645 20.7047 21.5956 19.6736 22.8675 19.6736H32.0797C33.3516 19.6736 34.3827 18.6425 34.3827 17.3705V15.0675H29.7767C28.5047 15.0675 27.4736 14.0364 27.4736 12.7644Z"
      fill="#B50102"
    />
  </svg>
);

interface HeaderProps {
  onPageChange?: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onPageChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [balance] = useState(1000); // Статичный баланс пока

  // Получаем информацию о пользователе
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;

      try {
        const response = await fetch(API_ENDPOINTS.auth.me, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, [user]);

  const handleLogout = async () => {
    try {
      // Отправляем запрос на logout
      await fetch(API_ENDPOINTS.auth.logout, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // В любом случае очищаем локальное состояние и перенаправляем
      await logout();
      navigate("/login");
    }
  };

  const getUserDisplayName = () => {
    if (userInfo?.first_name && userInfo?.last_name) {
      return `${userInfo.first_name} ${userInfo.last_name}`;
    }
    return userInfo?.username || user?.username || "Пользователь";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileClick = () => {
    if (onPageChange) {
      onPageChange("profile");
    }
  };

  return (
    <header className="w-full h-[72px] bg-white border-b border-gray-2 flex items-center justify-between px-6 shadow-sm">
      <Logo />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 px-4 py-2 hover:bg-gray-1 rounded-lg transition-colors cursor-pointer">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={userInfo?.avatar_url}
              alt={getUserDisplayName()}
            />
            <AvatarFallback className="bg-red-9 text-white text-sm font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-gray-900 leading-tight">
              {getUserDisplayName()}
            </span>
            {userInfo?.email && (
              <span className="text-xs text-gray-5 leading-tight">
                {userInfo.email}
              </span>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleProfileClick}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Профиль</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Выйти</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
