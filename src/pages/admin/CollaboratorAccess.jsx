import React, { useState } from "react";
import "./CollaboratorAccess.css"; // added

const CollaboratorAccess = () => {
  const [collaborators, setCollaborators] = useState([
    { id: 1, username: "Alice", role: "manager" },
    { id: 2, username: "Bob", role: "editor" },
  ]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [comments, setComments] = useState([
    { id: 1, username: "System", text: "Event created", created_at: new Date() },
  ]);

  const [inviteUser, setInviteUser] = useState("");
  const [role, setRole] = useState("editor");
  const [commentText, setCommentText] = useState("");

  // ---------- Actions ----------
  const sendInvite = () => {
    if (!inviteUser.trim()) return;
    const newInvite = {
      id: Date.now(),
      username: inviteUser,
      role,
      status: "pending",
    };
    setPendingInvites([...pendingInvites, newInvite]);
    setInviteUser("");
  };

  const acceptInvite = (id) => {
    const invite = pendingInvites.find((p) => p.id === id);
    setCollaborators([...collaborators, { ...invite, id }]);
    setPendingInvites(pendingInvites.filter((p) => p.id !== id));
  };

  const declineInvite = (id) => {
    setPendingInvites(pendingInvites.filter((p) => p.id !== id));
  };

  const changeRole = (id, newRole) => {
    setCollaborators(
      collaborators.map((c) =>
        c.id === id ? { ...c, role: newRole } : c
      )
    );
  };

  const removeCollaborator = (id) => {
    setCollaborators(collaborators.filter((c) => c.id !== id));
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now(),
        username: "You",
        text: commentText,
        created_at: new Date(),
      },
    ]);
    setCommentText("");
  };

  // ---------- Render ----------
  return (
    <div className="collaborator-access-container">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Invite + Collaborators */}
        <div className="card col-span-1">
          <div className="card-header">
            <h2 className="card-title">Collaborators</h2>
          </div>
          <div className="card-content space-y-4">
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="Username"
                value={inviteUser}
                onChange={(e) => setInviteUser(e.target.value)}
              />
              <select 
                className="select" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="manager">Manager</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button className="button" onClick={sendInvite}>Invite</button>
            </div>

            <h3 className="font-semibold mt-4">Pending Invites</h3>
            {pendingInvites.length === 0 && (
              <p className="text-sm text-gray-500">No pending invites</p>
            )}
            {pendingInvites.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-b py-2"
              >
                <span>{p.username} – {p.role}</span>
                <div className="space-x-2">
                  <button className="button-sm" onClick={() => acceptInvite(p.id)}>Accept</button>
                  <button className="button-sm button-destructive" onClick={() => declineInvite(p.id)}>Decline</button>
                </div>
              </div>
            ))}

            <h3 className="font-semibold mt-4">Active Collaborators</h3>
            {collaborators.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between border-b py-2"
              >
                <span>{c.username}</span>
                <select 
                  className="select" 
                  value={c.role} 
                  onChange={(e) => changeRole(c.id, e.target.value)}
                >
                  <option value="manager">Manager</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  className="button-destructive button-sm"
                  onClick={() => removeCollaborator(c.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Comments / Change Feed */}
        <div className="card col-span-1">
          <div className="card-header">
            <h2 className="card-title">Comments & Change Feed</h2>
          </div>
          <div className="card-content flex flex-col h-full">
            <div className="scroll-area flex-1 pr-2 mb-3">
              {comments.map((com) => (
                <div key={com.id} className="flex items-start gap-3 mb-4">
                  <div className="avatar">
                    <div className="avatar-fallback">{com.username[0]}</div>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{com.username}</span>{" "}
                      {com.text}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(com.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-auto">
              <input
                className="input"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button className="button" onClick={addComment}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorAccess;
