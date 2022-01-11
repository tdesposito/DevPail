import React, { useState, useEffect } from "react"

export default function AboutPanel() {
    const [show, setShow] = useState(false)
    const [content, setContent] = useState(0)

    useEffect(() => 
        {
            if (show) {
                fetch('/api')
                    .then(response => response.json())
                    .then(json => setContent(json.lucky) )
                    .catch(error => console.log(error))
                } 
        }, 
        [show]
    )

    if (show) {
        return (
            <>
                <button onClick={() => setShow(false)}>Hide This!</button>
                <div class="api">
                    <h3>Magic!</h3>
                    <p>
                        This API call randomly picked "{ content }" as your lucky number.
                    </p>
                </div>
            </>
        )
    } else {
        return (
            <button onClick={() => setShow(true)}>Pick Lucky Number!</button>
        )
    }
}
