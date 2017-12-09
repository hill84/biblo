import React from 'react';

const NoMatch = ({ location }) => (
    <div>
        <h1>Errore 404</h1>
        <h2>No match for <code>{location.pathname}</code></h2>
        <p>Aliquam felis ante, pulvinar sit amet libero a, elementum dictum quam. Maecenas condimentum vestibulum finibus. Duis in leo laoreet, euismod mauris id.</p>
        <p>&nbsp;</p>
    </div>
)

export default NoMatch;