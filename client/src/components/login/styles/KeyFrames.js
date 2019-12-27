import {keyframes} from 'styled-components';

export const PromptWrapperAnimation = keyframes`
  0% {
     transform:scaleY(0);
  }
  100% {
     transform:scaleY(1);
  }
`;

export const PromptTextAnimation = keyframes`
    0% {
        opacity: 0;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
`;