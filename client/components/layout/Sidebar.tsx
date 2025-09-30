import React from "react";
import { cn } from "@/lib/utils";
import { commonClasses } from "@/lib/design-system";
import BackToTopButton from "@/components/ui/BackToTopButton.tsx";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"
      fill="#868E96"
    />
  </svg>
);

const ServerIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 5C4.89543 5 4 5.89543 4 7V9C4 10.1046 4.89543 11 6 11H18C19.1046 11 20 10.1046 20 9V7C20 5.89543 19.1046 5 18 5H6ZM6 13C5.46957 13 4.96086 13.2107 4.58579 13.5858C4.21071 13.9609 4 14.4696 4 15V17C4 17.5304 4.21071 18.0391 4.58579 18.4142C4.96086 18.7893 5.46957 19 6 19H12C12.5523 19 13 19.4477 13 20C13 20.5523 12.5523 21 12 21H6C4.93913 21 3.92172 20.5786 3.17157 19.8284C2.42143 19.0783 2 18.0609 2 17V15C2 13.9391 2.42143 12.9217 3.17157 12.1716C3.23082 12.1123 3.29174 12.0551 3.35421 12C2.52377 11.2671 2 10.1947 2 9V7C2 4.79086 3.79086 3 6 3H18C20.2091 3 22 4.79086 22 7V9C22 11.2091 20.2091 13 18 13H6ZM7 7C7.55228 7 8 7.44772 8 8V8.01C8 8.56228 7.55228 9.01 7 9.01C6.44772 9.01 6 8.56228 6 8.01V8C6 7.44772 6.44772 7 7 7ZM18.001 13.5C18.5533 13.5 19.001 13.9477 19.001 14.5V15.1707C19.3521 15.2948 19.6732 15.4824 19.9505 15.7197L20.5319 15.384C21.0102 15.1078 21.6218 15.2717 21.8979 15.75C22.1741 16.2283 22.0102 16.8399 21.5319 17.116L20.9509 17.4515C20.9838 17.6293 21.001 17.8126 21.001 18C21.001 18.1873 20.9838 18.3705 20.951 18.5483L21.5326 18.8838C22.011 19.1598 22.1751 19.7713 21.8991 20.2497C21.6231 20.7281 21.0116 20.8922 20.5332 20.6162L19.9507 20.2801C19.6733 20.5175 19.3522 20.7052 19.001 20.8293V21.5C19.001 22.0523 18.5533 22.5 18.001 22.5C17.4487 22.5 17.001 22.0523 17.001 21.5V20.8293C16.6499 20.7052 16.3289 20.5177 16.0516 20.2804L15.4697 20.6162C14.9913 20.8922 14.3798 20.7281 14.1038 20.2497C13.8278 19.7713 13.9919 19.1598 14.4702 18.8838L15.051 18.5487C15.0182 18.3708 15.001 18.1874 15.001 18C15.001 17.8126 15.0182 17.6292 15.051 17.4513L14.4702 17.1162C13.9919 16.8402 13.8278 16.2287 14.1038 15.7503C14.3798 15.2719 14.9913 15.1078 15.4697 15.3838L16.0516 15.7196C16.3289 15.4823 16.6499 15.2948 17.001 15.1707V14.5C17.001 13.9477 17.4487 13.5 18.001 13.5ZM17.1187 17.5288C17.1247 17.5193 17.1305 17.5096 17.1362 17.4997C17.1415 17.4905 17.1466 17.4812 17.1516 17.4719C17.3282 17.1886 17.6426 17 18.001 17C18.3654 17 18.6842 17.1949 18.859 17.4861C18.8616 17.4908 18.8642 17.4954 18.8669 17.5C18.8697 17.5049 18.8726 17.5098 18.8755 17.5146C18.9554 17.6584 19.001 17.8239 19.001 18C19.001 18.1761 18.9554 18.3416 18.8755 18.4854C18.8725 18.4903 18.8696 18.4953 18.8667 18.5003C18.8641 18.5048 18.8615 18.5093 18.859 18.5139C18.6842 18.8051 18.3654 19 18.001 19C17.6426 19 17.3282 18.8114 17.1516 18.5281C17.1466 18.5188 17.1415 18.5095 17.1362 18.5003C17.1305 18.4904 17.1247 18.4807 17.1187 18.4712C17.0436 18.3308 17.001 18.1704 17.001 18C17.001 17.8296 17.0436 17.6692 17.1187 17.5288ZM7 15C7.55228 15 8 15.4477 8 16V16.01C8 16.5623 7.55228 17.01 7 17.01C6.44772 17.01 6 16.5623 6 16.01V16C6 15.4477 6.44772 15 7 15Z"
      fill="currentColor"
    />
  </svg>
);

const ToolIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.37878 3.96444L10.7072 6.29287C10.8947 6.48041 11.0001 6.73476 11.0001 6.99998V9.99998C11.0001 10.5523 10.5524 11 10.0001 11H7.0001C6.73488 11 6.48053 10.8946 6.29299 10.7071L3.96457 8.37866C3.89135 8.89116 3.89773 9.41496 3.98632 9.93127C4.16117 10.9504 4.64765 11.8902 5.37878 12.6213C6.10991 13.3524 7.04972 13.8389 8.0688 14.0138C9.08788 14.1886 10.1361 14.0432 11.0691 13.5976C11.4515 13.415 11.9075 13.4932 12.2072 13.7929L18.2072 19.7929C18.4175 20.0032 18.7027 20.1213 19.0001 20.1213C19.2975 20.1213 19.5827 20.0032 19.793 19.7929C20.0033 19.5826 20.1214 19.2974 20.1214 19C20.1214 18.7026 20.0033 18.4174 19.793 18.2071L13.793 12.2071C13.4933 11.9074 13.4151 11.4514 13.5977 11.069C14.0433 10.136 14.1887 9.08776 14.0139 8.06868C13.839 7.0496 13.3525 6.10979 12.6214 5.37866C11.8903 4.64753 10.9505 4.16104 9.93139 3.9862C9.41508 3.89761 8.89128 3.89123 8.37878 3.96444ZM6.06913 2.59761C7.37537 1.97376 8.84288 1.77022 10.2696 2.015C11.6963 2.25979 13.0121 2.94086 14.0356 3.96444C15.0592 4.98802 15.7403 6.30376 15.9851 7.73048C16.189 8.9193 16.0817 10.1364 15.6793 11.265L21.2072 16.7929C21.7926 17.3782 22.1214 18.1721 22.1214 19C22.1214 19.8278 21.7926 20.6217 21.2072 21.2071C20.6218 21.7924 19.8279 22.1213 19.0001 22.1213C18.1723 22.1213 17.3784 21.7924 16.793 21.2071L11.2651 15.6792C10.1366 16.0816 8.91942 16.1889 7.7306 15.985C6.30388 15.7402 4.98815 15.0591 3.96456 14.0355C2.94098 13.0119 2.25991 11.6962 2.01512 10.2695C1.77034 8.84276 1.97388 7.37525 2.59773 6.06901C2.73764 5.77607 3.01104 5.56927 3.331 5.51438C3.65096 5.45948 3.97765 5.56332 4.20721 5.79287L7.41431 8.99998H9.0001V7.41419L5.79299 4.20708C5.56344 3.97753 5.4596 3.65083 5.5145 3.33087C5.5694 3.01092 5.77619 2.73751 6.06913 2.59761Z"
      fill="currentColor"
    />
  </svg>
);

const TextIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.88639 4.54073C10.0084 4.21548 10.3193 4 10.6667 4H12.3333C12.6644 4 12.9641 4.19599 13.0968 4.49932L18.7117 17.3333H19C19.4602 17.3333 19.8333 17.7064 19.8333 18.1667C19.8333 18.6269 19.4602 19 19 19H18.1858C18.1733 19.0003 18.1608 19.0003 18.1484 19H14.8543C14.8405 19.0003 14.8268 19.0003 14.813 19H13.1667C12.7064 19 12.3333 18.6269 12.3333 18.1667C12.3333 17.7064 12.7064 17.3333 13.1667 17.3333H13.5755L12.5171 14.8333H7.80667L6.86917 17.3333H7.33333C7.79357 17.3333 8.16667 17.7064 8.16667 18.1667C8.16667 18.6269 7.79357 19 7.33333 19H5.68587C5.67301 19.0003 5.66013 19.0003 5.64722 19H4.83333C4.3731 19 4 18.6269 4 18.1667C4 17.7064 4.3731 17.3333 4.83333 17.3333H5.08917L9.88639 4.54073ZM8.43167 13.1667H11.8115L10.0192 8.93312L8.43167 13.1667ZM10.8694 6.66613L15.3854 17.3333H16.8925L11.7883 5.66667H11.2442L10.8694 6.66613Z"
      fill="currentColor"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.7071 6.29289C21.0976 6.68342 21.0976 7.31658 20.7071 7.70711L10.7071 17.7071C10.3166 18.0976 9.68342 18.0976 9.29289 17.7071L4.29289 12.7071C3.90237 12.3166 3.90237 11.6834 4.29289 11.2929C4.68342 10.9024 5.31658 10.9024 5.70711 11.2929L10 15.5858L19.2929 6.29289C19.6834 5.90237 20.3166 5.90237 20.7071 6.29289Z"
      fill="currentColor"
    />
  </svg>
);

export const DocumentIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7 4C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44771 20 7 20H17C17.5523 20 18 19.5523 18 19V5C18 4.44772 17.5523 4 17 4H7ZM4 5C4 3.34315 5.34315 2 7 2H17C18.6569 2 20 3.34315 20 5V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V5ZM8 7C8 6.44772 8.44772 6 9 6H15C15.5523 6 16 6.44772 16 7C16 7.55228 15.5523 8 15 8H9C8.44772 8 8 7.55228 8 7ZM8 11C8 10.4477 8.44772 10 9 10H15C15.5523 10 16 10.4477 16 11C16 11.5523 15.5523 12 15 12H9C8.44772 12 8 11.5523 8 11ZM8 15C8 14.4477 8.44772 14 9 14H13C13.5523 14 14 14.4477 14 15C14 15.5523 13.5523 16 13 16H9C8.44772 16 8 15.5523 8 15Z"
      fill="currentColor"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C10.3431 4 9 5.34315 9 7C9 8.65685 10.3431 10 12 10C13.6569 10 15 8.65685 15 7C15 5.34315 13.6569 4 12 4ZM7 7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7C17 9.76142 14.7614 12 12 12C9.23858 12 7 9.76142 7 7ZM10 16C9.20435 16 8.44129 16.3161 7.87868 16.8787C7.31607 17.4413 7 18.2043 7 19V21C7 21.5523 6.55228 22 6 22C5.44772 22 5 21.5523 5 21V19C5 17.6739 5.52678 16.4021 6.46447 15.4645C7.40215 14.5268 8.67392 14 10 14H14C15.3261 14 16.5979 14.5268 17.5355 15.4645C18.4732 16.4021 19 17.6739 19 19V21C19 21.5523 18.5523 22 18 22C17.4477 22 17 21.5523 17 21V19C17 18.2044 16.6839 17.4413 16.1213 16.8787C15.5587 16.3161 14.7956 16 14 16H10Z"
      fill="currentColor"
    />
  </svg>
);

const TowerIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.58579 2.58579C3.96086 2.21071 4.46957 2 5 2H6C6.53043 2 7.03914 2.21071 7.41421 2.58579C7.78929 2.96086 8 3.46957 8 4V5H9V4C9 3.46957 9.21071 2.96086 9.58579 2.58579C9.96086 2.21071 10.4696 2 11 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5H16V4C16 3.46957 16.2107 2.96086 16.5858 2.58579C16.9609 2.21071 17.4696 2 18 2H19C19.5304 2 20.0391 2.21071 20.4142 2.58579C20.7893 2.96086 21 3.46957 21 4V8.39378C21 8.3937 21 8.39385 21 8.39378C21.0001 8.9863 20.8247 9.5658 20.496 10.0588L19.1681 12.0507C19.0585 12.215 19 12.4082 19 12.6058V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V12.606C5.00004 12.4085 4.94159 12.2151 4.832 12.0508L3.504 10.0588C3.50398 10.0588 3.50402 10.0588 3.504 10.0588C3.17532 9.56581 2.99991 8.98649 3 8.394C3 8.39393 3 8.39407 3 8.394V4C3 3.46957 3.21071 2.96086 3.58579 2.58579ZM11 20H13V16C13 15.7348 12.8946 15.4804 12.7071 15.2929C12.5196 15.1054 12.2652 15 12 15C11.7348 15 11.4804 15.1054 11.2929 15.2929C11.1054 15.4804 11 15.7348 11 16V20ZM15 20V16C15 15.2043 14.6839 14.4413 14.1213 13.8787C13.5587 13.3161 12.7957 13 12 13C11.2043 13 10.4413 13.3161 9.87868 13.8787C9.31607 14.4413 9 15.2043 9 16V20H7V12.6062C7 12.6061 7 12.6063 7 12.6062C7.00009 12.0137 6.82473 11.4343 6.49605 10.9413C6.49603 10.9413 6.49607 10.9413 6.49605 10.9413L5.16805 8.9493C5.05846 8.78495 4.99996 8.59176 5 8.39422L5 4H6V6C6 6.55228 6.44772 7 7 7H10C10.5523 7 11 6.55228 11 6V4H13V6C13 6.55228 13.4477 7 14 7H17C17.5523 7 18 6.55228 18 6L18 4H19V8.394C19 8.59153 18.9416 8.78488 18.832 8.94922L17.504 10.9412C17.504 10.9412 17.504 10.9412 17.504 10.9412C17.1753 11.4342 16.9999 12.0135 17 12.606C17 12.6059 17 12.6061 17 12.606V20H15Z"
      fill="currentColor"
    />
  </svg>
);

const TelegramIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.6612 3.24982C21.9416 3.49699 22.0608 3.87991 21.9701 4.24255L17.9701 20.2426C17.8828 20.5921 17.6141 20.8676 17.2669 20.9637C16.9197 21.0599 16.5476 20.9619 16.2929 20.7071L12.1082 16.5224L9.80001 19.6C9.57684 19.8976 9.20697 20.0467 8.83982 19.9871C8.47268 19.9275 8.16894 19.6691 8.05132 19.3162L6.18231 13.7092L2.55279 11.8944C2.19901 11.7176 1.98274 11.3488 2.00108 10.9537C2.01942 10.5585 2.26892 10.2114 2.63756 10.068L20.6376 3.06801C20.9859 2.93253 21.3808 3.00266 21.6612 3.24982ZM12.7193 14.3051C12.7119 14.2975 12.7044 14.2899 12.6967 14.2825L12.4142 14L15.7071 10.7071C16.0976 10.3166 16.0976 9.68343 15.7071 9.29291C15.3166 8.90239 14.6834 8.90239 14.2929 9.29291L10.2929 13.2929C9.90237 13.6834 9.90237 14.3166 10.2929 14.7071L10.6796 15.0939L9.34515 16.8732L7.94869 12.6838C7.86482 12.4322 7.68444 12.2242 7.44722 12.1056L5.46487 11.1144L19.5611 5.63255L16.4582 18.044L12.7193 14.3051Z"
      fill="currentColor"
    />
  </svg>
);

const ChevronUpIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.2929 8.29289C11.6834 7.90237 12.3166 7.90237 12.7071 8.29289L18.7071 14.2929C19.0976 14.6834 19.0976 15.3166 18.7071 15.7071C18.3166 16.0976 17.6834 16.0976 17.2929 15.7071L12 10.4142L6.70711 15.7071C6.31658 16.0976 5.68342 16.0976 5.29289 15.7071C4.90237 15.3166 4.90237 14.6834 5.29289 14.2929L11.2929 8.29289Z"
      fill="currentColor"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
      fill="currentColor"
    />
  </svg>
);

const QueryIndexIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 3C3 2.44772 3.44772 2 4 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V3ZM5 4V20H19V4H5Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7 15C7 14.4477 7.44772 14 8 14H9C9.55228 14 10 14.4477 10 15V17C10 17.5523 9.55228 18 9 18H8C7.44772 18 7 17.5523 7 17V15Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11 12C11 11.4477 11.4477 11 12 11H13C13.5523 11 14 11.4477 14 12V17C14 17.5523 13.5523 18 13 18H12C11.4477 18 11 17.5523 11 17V12Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15 9C15 8.44772 15.4477 8 16 8H17C17.5523 8 18 8.44772 18 9V17C18 17.5523 17.5523 18 17 18H16C15.4477 18 15 17.5523 15 17V9Z"
      fill="currentColor"
    />
  </svg>
);

const LinkAnalyzerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5L21 3m-5 0h5v5m0 6v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>
  </svg>
)

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  subItems?: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
}

const menuItems: MenuItem[] = [
  {
    id: "services",
    label: "Сервисы",
    icon: <ServerIcon />,
    subItems: [
      {
        id: "semantics",
        label: "Семантикс",
        icon: <ToolIcon />,
      },
      {
        id: "text-analyzer",
        label: "Текстовый анализатор",
        icon: <TextIcon />,
      },
      {
        id: "query-index",
        label: "Прокачка запросного индекса",
        icon: <QueryIndexIcon />,
      },
      {
        id: "link-analyzer",
        label: "Анализ ссылок",
        icon: <LinkAnalyzerIcon />,
      },
    ],
  },
  {
    id: "documentation",
    label: "Документация",
    icon: <DocumentIcon />,
  },
  {
    id: "profile",
    label: "Личный кабинет",
    icon: <UserIcon />,
  },
  {
    id: "seo-guild",
    label: "SEO-гильдия",
    icon: <TowerIcon />,
  },
  {
    id: "telegram",
    label: "Блог в телеграмм",
    icon: <TelegramIcon />,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
}) => {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([
    "services",
  ]);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPinned, setIsPinned] = React.useState(() => {
    const saved = localStorage.getItem('sidebar-pinned');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setExpandedItems([]);
      setTimeout(() => {
        setIsHovered(false);
      }, 150);
    }
  };

  const togglePin = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    
    localStorage.setItem('sidebar-pinned', JSON.stringify(newPinnedState));
    
    if (newPinnedState) {
      setIsHovered(true);
    }
  };

  const PinIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 7V5C5 3.34315 6.34315 2 8 2C9.65685 2 11 3.34315 11 5V7H12C12.5523 7 13 7.44772 13 8V12C13 12.5523 12.5523 13 12 13H4C3.44772 13 3 12.5523 3 12V8C3 7.44772 3.44772 7 4 7H5ZM7 5C7 4.44772 7.44772 4 8 4C8.55228 4 9 4.44772 9 5V7H7V5Z"
      fill={isPinned ? "#495057" : "#868E96"}
    />
  </svg>
);

  return (
    <aside 
      className={cn(
        "h-[calc(100vh-59px)] bg-gray-0 p-4 flex flex-col gap-1.5 transition-all duration-300 ease-in-out relative overflow-hidden",
        {
          "w-[360px]": isHovered || isPinned,
          "w-[80px]": !isHovered && !isPinned,
        }
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformOrigin: 'left center',
      }}
    >
      {/* Navigation menu */}
      <div className="bg-white rounded-lg p-2 flex-1 overflow-hidden relative">
        <div className={cn(
          "absolute top-2 right-2 transition-opacity duration-200 z-10",
          {
            "opacity-100": isHovered || isPinned,
            "opacity-0": !isHovered && !isPinned,
          }
        )}>
          <button
            onClick={togglePin}
            className={cn(
              "p-2 rounded-lg transition-all duration-200 hover:bg-gray-100",
              {
                "bg-gray-100": isPinned,
                "bg-transparent": !isPinned,
              }
            )}
            title={isPinned ? "Открепить меню" : "Закрепить меню"}
          >
            <PinIcon />
          </button>
        </div>

        <nav className="space-y-1 pt-8">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.subItems) {
                    toggleExpanded(item.id);
                  } else {
                    onPageChange(item.id);
                  }
                }}
                className={cn(
                  "w-full flex items-center rounded text-left py-3 pr-3 pl-[5px]",
                  commonClasses.transition,
                  commonClasses.font,
                  "font-normal text-sm",
                  {
                    "text-red-9":
                      (item.subItems && currentPage.startsWith(item.id)) ||
                      (!item.subItems && currentPage === item.id),
                    "text-black": !(
                      (item.subItems && currentPage.startsWith(item.id)) ||
                      (!item.subItems && currentPage === item.id)
                    ),
                    "hover:bg-gray-0": true,
                  },
                )}
              >
                <span
                  className={cn("flex-shrink-0",{
                    "text-red-9":
                      (item.subItems && currentPage.startsWith(item.id)) ||
                      (!item.subItems && currentPage === item.id),
                    "text-black": !(
                      (item.subItems && currentPage.startsWith(item.id)) ||
                      (!item.subItems && currentPage === item.id)
                    ),
                  })}
                >
                  {item.icon}
                </span>
                
                <span className={cn(
                  "flex-1 ml-3 whitespace-nowrap transition-opacity duration-150",
                  {
                    "opacity-100": isHovered || isPinned,
                    "opacity-0": !isHovered && !isPinned,
                  }
                )}>
                  {item.label}
                </span>
                
                {item.subItems && (
                  <span
                    className={cn(
                      "transition-all duration-300 ease-in-out ml-2",
                      {
                        "rotate-180": expandedItems.includes(item.id),
                        "opacity-100": isHovered || isPinned,
                        "opacity-0": !isHovered && !isPinned,
                      },
                    )}
                  >
                    <ChevronUpIcon />
                  </span>
                )}
              </button>

              {item.subItems && (isHovered || isPinned) && (
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200 ease-in-out",
                    {
                      "max-h-0 opacity-0": !expandedItems.includes(item.id),
                      "max-h-96 opacity-100": expandedItems.includes(item.id),
                    },
                  )}
                >
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => onPageChange(subItem.id)}
                        className={cn(
                          "w-full flex items-center p-3 rounded text-left",
                          commonClasses.transition,
                          commonClasses.font,
                          "font-normal text-sm",
                          {
                            "text-red-9 bg-red-0": currentPage === subItem.id,
                            "text-black hover:bg-gray-0":
                              currentPage !== subItem.id,
                          },
                        )}
                      >
                        <span
                          className={cn("flex-shrink-0",{
                            "text-red-9": currentPage === subItem.id,
                            "text-[#868E96]": currentPage !== subItem.id,
                          })}
                        >
                          {subItem.icon}
                        </span>
                        <span className={cn(
                          "flex-1 ml-3 whitespace-nowrap transition-opacity duration-150",
                          {
                            "opacity-100": isHovered || isPinned,
                            "opacity-0": !isHovered && !isPinned,
                          }
                        )}>
                          {subItem.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
        
        {(isHovered || isPinned) && <BackToTopButton />}
      </div>
    </aside>
  );
};