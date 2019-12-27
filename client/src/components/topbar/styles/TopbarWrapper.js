import styled from "styled-components";

export const TopbarWrapperEl = styled.div`
    display: block;
    background: #131929;
    height: 50px;
    padding-top: 5px;
    
    & > p {
        color: white;
    }
    
    & > input:hover {
        cursor: pointer;
    }
    
    & > label {
        margin-left: 4px;
        font-size: 0.85em;
    }
`;