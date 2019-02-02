import React, {Component} from "react";

class NotFound extends Component {

  componentDidMount() {
    document.title = "404: Not Found";
  }

  render() {
    return <div><h1>Error 404</h1><h3>Page not found</h3></div>;
  }
}

export default NotFound;