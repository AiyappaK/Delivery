import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DatePick = (props) => {
  return (
    <>
    <div className="flex flex-col lg:flex-row  justify-end">
    <div className=" w-64 flex flex-row items-center pr-4">
            <label className="px-3 w-16">{props.label}</label>
     <div className="w-48 ">
        <DatePicker  
          className=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          dateFormat="MMM d, yyyy h:mm aa"
          data-disable-touch-keyboard
          selected={props.select}
          disabledKeyboardNavigation
        //   showYearDropdown
        //   showMonthDropdown
          showTimeSelect
        //   withPortal
          onChange={props.changed}
          placeholder="Select date"
          onFocus={e => e.target.blur()}
        />
     </div>
     </div>
</div>
      {/* <input type="datetime-local" value={props.select} dateformat="MMM d, yyyy h:mm aa" onChange={props.changed}/> */}
    </>
  );
};
export default DatePick;
