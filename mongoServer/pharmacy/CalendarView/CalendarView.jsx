import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isToday,isSameDay } from 'date-fns';
import { AppointmentContainer, BgContainer, ButtonItemForAppointments, CalenderContainer, DateMsg, DayMsg, DaysContainer, StyledDateCell } from './StyledComponents';
import { AppointmentTimings } from '../../../shared/sharedData';

const SingleRowCalendar = ({getDate,getTime,selectedDate,appointmentTime}) => {

  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Track the current month
  const [clickedDate, setClickedDate] = useState()
  const [selectedTime,setSelectedTime]=useState("")

  // Get the start and end dates of the current month
  const startOfCurrentMonth = startOfMonth(currentMonth);
  const endOfCurrentMonth = endOfMonth(currentMonth);
  
  // Get all the days in the current month
  const daysInMonth = eachDayOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth });

  // Functions to navigate to the previous and next months
  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleDateClick=(day)=>{
    // console.log(format(day,"yyyy MMM dd"))
    setClickedDate(day)
    const rawDate=new Date(day)
    getDate(format(rawDate,"dd MMM yyyy"))

  }

  const passValue=(i)=>{
    setSelectedTime(i)
    getTime(i)
  }
  useEffect(()=>{
    if(selectedDate!==undefined){
      setClickedDate(selectedDate)
    }
    if(appointmentTime !==undefined){
      setSelectedTime(appointmentTime)
    }
  })
  return (
    <BgContainer>
      <CalenderContainer>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={handlePreviousMonth}>Previous</button>
    {/* font-family:Georgia, 'Times New Roman', Times, serif; */}
            <h2 style={{color:"blue",fontFamily:'serif'}}>{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={handleNextMonth}>Next</button>
          </div>
          <DaysContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {daysInMonth.map((day, index) => (
                <StyledDateCell
                  key={index}
                 style={{
                  backgroundColor: isSameDay(day,clickedDate) ? '#08107D' : 'transparent',
                  color: isSameDay(day,clickedDate) ? 'white' : 'black',
                }}
                  Highlight current day
                  onClick={() =>  handleDateClick(day)}
                >
                  <DayMsg>{format(day, 'EEE')}</DayMsg>
                  <DateMsg>{format(day, 'dd')}</DateMsg>
                </StyledDateCell>
              ))}
            </div>
          </DaysContainer>
        </div>

      </CalenderContainer>
      <AppointmentContainer>
        {
          AppointmentTimings.map(e=>(
          <ButtonItemForAppointments type="button" available={"Active"===e.status} onClick={()=>passValue(e.value)} clicked={selectedTime==e.value} key={e}>
            {e.value}
          </ButtonItemForAppointments>))
        }
      </AppointmentContainer>
    </BgContainer>
  );
};

export default SingleRowCalendar;
