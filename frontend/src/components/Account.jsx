import React, {useEffect, useState} from "react";

function Account() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    return <>
        <div className="Personal-Info">
            <h1 className="m-10"> Account Information</h1>

        </div>
        
    </>
}
export default Account;