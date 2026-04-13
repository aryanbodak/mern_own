import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import UsersSection from "./UsersSection";
import CoursesSection from "./CoursesSection";
import CourseFormModal from "./CourseFormModal";

const EMPTY_FORM = {
  title: "",
  tag: "Dev",
  description: "",
  duration: "",
  lessons: "",
  color: "#6366f1",
  topics: [{ topicName: "", subTopics: [{ subTopicName: "", data: "" }] }]
};

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast] = useState(null);

  const adminHeaders = {
    "Content-Type": "application/json",
    "x-admin-user": ADMIN_USER,
    "x-admin-pass": ADMIN_PASS,
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: adminHeaders,
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/courses");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const handleSave = async () => {
    if (!form.title || !form.tag) {
      return showToast("Title and tag required", "error");
    }

    const url = editId
      ? `http://localhost:5000/api/admin/courses/${editId}`
      : "http://localhost:5000/api/admin/courses";

    const method = editId ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        headers: adminHeaders,
        body: JSON.stringify({ ...form, lessons: Number(form.lessons) }),
      });

      showToast(editId ? "Updated!" : "Created!");
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchCourses();
    } catch {
      showToast("Error saving", "error");
    }
  };

  return (
    <div className="admin-root">
      <div className="admin-layout">

        {/* Sidebar */}
        <Sidebar tab={tab} setTab={setTab} onLogout={handleLogout} />

        {/* Main Content */}
        <main className="admin-main">

          {tab === "users" && (
            <UsersSection
              users={users}
              loading={loading}
              search={search}
              setSearch={setSearch}
            />
          )}

          {tab === "courses" && (
            <CoursesSection
              courses={courses}
              loading={loading}
              search={search}
              setSearch={setSearch}
              onAdd={() => {
                setForm(EMPTY_FORM);
                setEditId(null);
                setShowForm(true);
              }}
              onEdit={(c) => {
                setForm(c);
                setEditId(c._id);
                setShowForm(true);
              }}
              onDelete={(id) => setDeleteModal(id)
              }
            />
          )}

        </main>
      </div>

      {/* Form Modal */}
      {showForm && (
        <CourseFormModal
          form={form}
          setForm={setForm}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          editId={editId}
        />
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Course?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-btns">
              <button onClick={() => setDeleteModal(null)} className="modal-cancel">
                Cancel
              </button>
              <button
                className="modal-delete"
                onClick={async () => {
                  await fetch(
                    `http://localhost:5000/api/admin/courses/${deleteModal}`,
                    { method: "DELETE", headers: adminHeaders }
                  );
                  showToast("Deleted");
                  setDeleteModal(null);
                  fetchCourses();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}