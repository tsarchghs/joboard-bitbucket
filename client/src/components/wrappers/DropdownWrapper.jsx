import React from "react";

class DropdownWrapper extends React.Component {
    constructor(props){
        super(props);
        this.childrenRef = React.createRef();
        this.handleClick = this.handleClick.bind(this)
    }
    componentDidMount() {
        window.addEventListener("mousedown", this.handleClick);
        window.addEventListener("mouseup", this.handleClick);
    }
    componentWillUnmount() {
        window.removeEventListener("mousedown", this.handleClick);
        window.removeEventListener("mouseup", this.handleClick);
    }
    handleClick(e){
        console.log(this.toggleButton,this.childrenRef)
        if (!this.childrenRef) return; 
        if (
            !this.props.toggleButton || (this.props.toggleButton.current && !this.props.toggleButton.current.contains(e.target)) 
        ){
            if (!this.childrenRef.current.contains(e.target) && this.props.displayed){
                this.props.toggleDropdown();
            }
        }
    }
    render(){   
        return (
            <div ref={this.childrenRef}>
                {React.cloneElement(this.props.children)}
            </div>
        )
    }
}

export default DropdownWrapper;
