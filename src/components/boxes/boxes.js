import React from 'react'

const Total = (props) => {
    <div className="py-4">
    <div className=" w-32  shadow-md bg-white rounded font-medium p-2">
            <h6>{props.title} </h6>
            <h3 className="text-center">
              {props.balance}
              &nbsp; INR
            </h3>
          </div>
          </div>
}
export default Total;