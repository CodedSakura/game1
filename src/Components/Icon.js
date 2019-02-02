import React from 'react';

function Icon(props) {
  return (
    <span className={"m-1 oi oi-" + props.name}/>
  );
}

export default Icon;