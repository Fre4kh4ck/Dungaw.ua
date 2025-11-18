import axios from "axios";
import React, { useState, useEffect } from "react";

let editData = { username: "", password: "", id: null };
let updateModal = null;

// 👇 this is called from your Edit button
export function FillAccountForm(username, password, id) {
  editData = { username, password, id };
  if (updateModal) updateModal(editData); // update modal state
}

export default function EditUser() {
  const [form, setForm] = useState({ username: "", password: "", id: null });

  // Register update function when modal is mounted
  useEffect(() => {
    updateModal = (data) => setForm(data);
  }, []);

  async function ModifyUser() {
    if (!form.id) return;

    await axios.put("http://dungaw.ua:4435/accounts/edit", {
      username: form.username,
      password: form.password,
      id: form.id,
    });
  }

  return (
    <div id="editUser" className="modal fade" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit User</h5>
            <button className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="editUsername" className="form-label">Username</label>
              <input
                id="editUsername"
                className="form-control"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Edit username"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="editPassword" className="form-label">Password</label>
              <input
                id="editPassword"
                className="form-control"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Edit password"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button
              className="btn btn-primary"
              data-bs-dismiss="modal"
              onClick={ModifyUser}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
