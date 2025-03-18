import { styled } from "styled-components"

export const BgContainer = styled.div`
     /* overflow-y:hidden; */
     width: 100%;
     display: flex;
     flex-direction: column;
     gap: 0.5rem;
     /* padding: 0.5rem; */
`

export const CalenderContainer = styled.div`
    margin: 0;
    padding: 0.5rem;
    overflow: auto;
     overflow-y:hidden;
     max-height:20vh;
     width:100%;
     flex-grow:1;
    background-color:white;
    border-radius:5px;
    box-shadow: 0px 8px 16px rgba(8, 16, 125, 0.3); /* Blue shadow */


`

export const DayMsg = styled.p`
    
    font-weight:normal;
    `
export const DateMsg = styled.p`

    font-weight:bold;

`
export const DaysContainer = styled.div`
    height:fit-content;
    width:100%;
    overflow:auto;
    overflow-y:hidden;
    margin:0;
    flex-grow:1;
    padding:0;
   

    `;

export const StyledDateCell = styled.div`
  flex: 0 0 56px;
  text-align: center;
//   padding: 10px;
  border: none;
  cursor: pointer;
  background-color: ${({ isToday }) => (isToday ? '#08107D' : 'transparent')};
  color: ${({ isToday }) => (isToday ? 'white' : 'black')};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #08107D;
    color:white;
  }
`;

export const AppointmentContainer = styled.div`
    height:25vh;
    width:100%;
  
    padding:1rem;
    gap: 1rem;
    display: flex;
    flex-direction: row;
    flex-wrap:wrap;
    background-color: white;
    border-radius:5px;
    box-shadow: 0px 8px 16px rgba(8, 16, 125, 0.3); /* Blue shadow */

`
export const 
ButtonItemForAppointments = styled.button`
height:fit-content;
width: fit-content;
/* border:1px solid blue; */
border-radius:1rem;
margin:0;
color:${({ available,clicked }) => (available ? clicked?"#fff":'#000' : 'grey')};
cursor: ${({ available }) => (available ? "pointer" : "not-allowed")}; /* Apply no-drop */
opacity: ${({ available }) => (available ? "1" : "0.6")}; /* Dim if not available */
  pointer-events: ${({ available }) => (available ? "auto" : "none")};
border:1.5px solid #08107D;
background-color: ${({ clicked}) => (clicked? " #08107D" : "")};
`
