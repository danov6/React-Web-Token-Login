import styled from "styled-components";

export const CheckboxWrapper = styled.div`
    padding-top: 5px;
    
    & > input {
        width: 18px;
        height: 18px;
        position: relative;
        top: 2px;
    }
    
    & > input:hover {
        cursor: pointer;
    }
    
    & > label {
        margin-left: 4px;
        font-size: 0.85em;
    }
`;