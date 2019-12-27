import styled from "styled-components";
import {PromptWrapperAnimation, PromptTextAnimation} from './KeyFrames';

export const Wrapper = styled.div`
    padding: 0 15px;
    border-radius: 4px;
    margin: 0 0 15px 0;
    transform-origin: top;
    animation: ${PromptWrapperAnimation} 0.4s ease-in-out 1 forwards;
    border: 1px solid ${props => props.theme.mainBorder};
    background: ${props => props.theme.mainBackground};
    color: ${props => props.theme.mainColor};
`;

export const Text = styled.h1`
    font-size: 0.85em;
    opacity: 0;
    display: inline-block;
    line-height: 1.3em;
    margin: 10px 0;
    animation: ${PromptTextAnimation} 0.4s ease-in-out 1 forwards;
`;

export const Link = styled.span`
    text-decoration: underline;
    &:hover {
        cursor: pointer;
    }
`;

// Set a default theme
Wrapper.defaultProps = {
    theme: {
        mainBorder: "#F4485B",
        mainBackground: "rgba(244,72,91,0.1)",
        mainColor: "#ED3448"
    }
};