import axios from "axios";

let id = null;

async function ForceDeleteUser() {
    const data = {
        id: id
    };

    await axios.post('http://dungaw.ua:4435/accounts/delete', data);
}

export function SetAccountId(idXYZ) {
    return id = idXYZ;
}

export default function DeleteUser() {
    return (
        <>
            <div id='deleteUser' className="modal">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1>Delete user</h1>
                        </div>

                        <div className="modal-body">
                            <p>Are you sure to delete this user?</p>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-bs-dismiss='modal'>Cancel</button>
                            <button className="btn btn-primary" data-bs-dismiss='modal' onClick={() => ForceDeleteUser()}>Done</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}