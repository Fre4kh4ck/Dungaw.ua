import axios from "axios";

async function CreateUser(a, b, c, d) {
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");

    const data = {
        name: a,
        username: b,
        password: c,
        role: d,
        creation: `${year}${month}${day}`
    };

    try {
        await axios.post('http://dungaw.ua:4435/accounts/post', data);
        console.log("User created:", data);
    } catch (err) {
        console.error("Error creating user:", err);
    }
}

export default function AddUser() {
    return (
        <div id='addUser' className="modal">
            <div className='modal-dialog'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h1 className="modal-title">Add new user</h1>
                        <button type='button' className="btn-close" data-bs-dismiss='modal' aria-label="Close"></button>
                    </div>

                    <div className="modal-body">

                        <div className="mb-3">
                            <label htmlFor="addRole" className="mb-1">Role</label>
                            <div className="input-group">
                                <input id='addRole' name='addRole' className="form-control" placeholder="Select role" readOnly={true} />
                                <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle='dropdown'>Role</button>
                                <ul className="dropdown-menu">
                                    <li onClick={() => document.getElementById('addRole').value = 'Admin'}><a href="#" className="dropdown-item">admin</a></li>
                                    <li onClick={() => document.getElementById('addRole').value = 'Co-Admin'}><a href="#" className="dropdown-item">co-admin</a></li>
                                </ul>
                            </div>
                        </div>  

                        <div className="mb-3">
                            <label htmlFor="addName" className="form-label">Department</label>
                            <input id='addName' name='addName' className='form-control' placeholder="Add Department" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="addUsername" className="form-label">Username</label>
                            <input id='addUsername' name='addUsername' className='form-control' placeholder="Create username" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="addPassword" className="form-label">Password</label>
                            <input id='addPassword' name='addPassword' className='form-control' placeholder="Create password" />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary" data-bs-dismiss='modal'>Cancel</button>
                        <button 
                          id='confirmAddUser' 
                          className="btn btn-primary"
                          data-bs-dismiss='modal' 
                          onClick={() => CreateUser(
                              document.getElementById('addName').value,
                              document.getElementById('addUsername').value,
                              document.getElementById('addPassword').value,
                              document.getElementById('addRole').value
                          )}
                        >
                          Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
