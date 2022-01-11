import React from "react"

export default class AboutPanel extends React.Component {
    constructor(props) {
        super(props)
        this.state = { show: props.show }
    }
    render() {
        if (this.state.show) {
            return (
                <>
                    <button onClick={() => this.setState({ show: false })}>Hide This!</button>
                    <div>
                        <h3>This is a React app!</h3>
                        <p>
                            React Apps dynamically morph the DOM.
                        </p>
                    </div>
                </>
            )
        } else {
            return (
                <button onClick={() => this.setState({ show: true })}>Click Me!</button>
            )
        }
    }
}
