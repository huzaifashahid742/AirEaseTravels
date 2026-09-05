// import './App.css';
// import { lazy, Suspense, useState } from 'react';
// import '@fortawesome/fontawesome-free/css/all.min.css';
// import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
// import {AuthProvider}  from './Context/AuthContext';
// import ErrorBoundary from './Components/ClientSide/ErrorBoundary';
// import PageLoader from './Components/ClientSide/PageLoader';
// import AdminRoute from './Components/ClientSide/AdminRoute';
// import UserRoute from './Components/ClientSide/UserRoute';
// import AdminPermissionRoute from './Components/ClientSide/AdminPermissionRoute';
// import UserLayout from './Components/ClientSide/UserLayout';
// import AdminLayout from './Components/ClientSide/AdminLayout';
// import UserAccountLayout from './Components/ClientSide/UserAccountLayout';
// import ContactModal from './Components/ClientSide/Contact_Us';
// import AuthSuccess from './Components/ClientSide/AuthSuccess'; // Adjust path to where you saved AuthSuccess.jsx
// import StudentProfile from './Components/ClientSide/StudentProfile';


// const Home = lazy(() => import('./Components/ClientSide/Home'));
// const Programs_List = lazy(() => import('./Components/ClientSide/Programs_List'));
// const Programs_Detail = lazy(() => import('./Components/ClientSide/Programs_Detail'));
// const Universities_List = lazy(() => import('./Components/ClientSide/Universities_List'));
// const Universities_Comparisons = lazy(() => import('./Components/ClientSide/Universities_Comparisons'));
// const AuthPage = lazy(() => import('./Components/ClientSide/Auth'));
// const GlobalSearch = lazy(() => import('./Components/ClientSide/GlobalSearch'));
// const NotFound = lazy(() => import('./Components/ClientSide/NotFound'));
// const UserDashboard = lazy(() => import('./Components/ClientSide/UserDashboard'));
// const UserApplications = lazy(() => import('./Components/ClientSide/UserApplications'));
// const UserProfile = lazy(() => import('./Components/ClientSide/UserProfile'));
// const UserApplicationView = lazy(() => import('./Components/ClientSide/UserApplicationView'));
// const ApplyViaUsWizard = lazy(() => import('./Components/ClientSide/ApplyViaUsWizard'));
// const Admin_Panel = lazy(() => import('./Components/ClientSide/Admin_Panel'));
// const University_Admin = lazy(() => import('./Components/ClientSide/University_Admin'));
// const Students_Admin = lazy(() => import('./Components/ClientSide/Students_Admin'));
// const Student_View_Form = lazy(() => import('./Components/ClientSide/Student_View_Form'));
// const EditUniversityAdmin = lazy(() => import('./Components/ClientSide/EditUniversityAdmin'));
// const AddUniversityAdmin = lazy(() => import('./Components/ClientSide/AddUniversityAdmin'));
// const ProgramForm = lazy(() => import('./Components/ClientSide/AddProgramAdmin'));
// const UniversityProgramsAdmin = lazy(() => import('./Components/ClientSide/UniversityProgramsAdmin'));
// const ProgramViewAdmin = lazy(() => import('./Components/ClientSide/ProgramViewAdmin'));
// const ProgramDetailCard = lazy(() => import('./Components/ClientSide/UniversityProgramDetail'));
// const AdminTeam = lazy(() => import('./Components/ClientSide/AdminTeam'));

// // Lazy loading the new Country/University comparison form component
// const CountryComparisonForm = lazy(() => import('./Components/ClientSide/CountryComparisonForm'));

// const LazyFallback = () => <PageLoader label="Loading..." />;

// const LegacyApplyRedirect = () => {
//   const { programId } = useParams();
//   return <Navigate to={`/user/apply/${programId}`} replace />;
// };

// function App() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const openModal = () => setIsModalOpen(true);
//   const closeModal = () => setIsModalOpen(false);

//   return (
//     <div className="App">
//       <ErrorBoundary>
//         <AuthProvider>
//           <Router>
//             <Suspense fallback={<LazyFallback />}>
//               <Routes>
//                 {/* Global redirects to admin matching root layout structures */}
//                 <Route path="/AdminPanel" element={<Navigate to="/admin/AdminPanel" replace />} />
//                 <Route path="/UniversityAdmin" element={<Navigate to="/admin/UniversityAdmin" replace />} />
//                 <Route path="/StudentAdmin" element={<Navigate to="/admin/StudentAdmin" replace />} />
//                 <Route path="/Student_View_Form" element={<Navigate to="/admin/Student_View_Form" replace />} />
//                 <Route path="/EditUniversityForm" element={<Navigate to="/admin/EditUniversityForm" replace />} />
//                 <Route path="/add-university" element={<Navigate to="/admin/add-university" replace />} />
//                 <Route path="/edit-university" element={<Navigate to="/admin/edit-university" replace />} />
//                 <Route path="/UniversityProgramDetail" element={<Navigate to="/admin/UniversityProgramDetail" replace />} />
//                 {/* <Route path="complete-profile" element={<CompleteProfile />} 
//                 /> */}

//                 <Route element={<UserLayout onContactClick={openModal} />}>
//                   <Route path="/" element={<Home />} />
//                   <Route path="/Programs_List" element={<Programs_List onContactClick={openModal} />} />
//                   <Route path="/Programs_Detail/:id" element={<Programs_Detail />} />
//                   <Route path="/Programs_Detail" element={<Navigate to="/Programs_List" replace />} />
//                   <Route path="/Universities_List" element={<Universities_List onContactClick={openModal} />} />
//                   <Route path="/University_Comparisons" element={<Universities_Comparisons onContactClick={openModal} />} />
//                   <Route path="/Search" element={<GlobalSearch />} />
//                   <Route path="/Login_Page" element={<AuthPage />} />
//                   <Route path="/auth-success" element={<AuthSuccess />} />
//                   <Route path="/ApplyViaUs/:programId" element={<LegacyApplyRedirect />} />
//                   <Route path="/ApplyViaUs" element={<Navigate to="/Programs_List" replace />} />

//                   <Route path="/user" element={<UserRoute />}>
//                     <Route element={<UserAccountLayout />}>
//                       <Route index element={<Navigate to="dashboard" replace />} />
//                       <Route path="profile" element={<UserProfile />} />
//                       <Route path="dashboard" element={<UserDashboard />} />
//                       <Route path="applications" element={<UserApplications />} />
//                       <Route path="applications/:id" element={<UserApplicationView />} />

//                       <Route path="apply" element={<Navigate to="/Programs_List" replace />} />
//                       <Route path="apply/:programId" element={<ApplyViaUsWizard />} />
//                     </Route>
//                   </Route>
//                 </Route>

//                 <Route path="/admin" element={<AdminRoute />}>
//                   <Route element={<AdminLayout />}>
//                     <Route index element={<Navigate to="AdminPanel" replace />} />
//                     <Route path="AdminPanel" element={<Admin_Panel />} />

//                     <Route element={<AdminPermissionRoute permission="manageTeam" />}>
//                       <Route path="team" element={<AdminTeam />} />
//                     </Route>

//                     <Route element={<AdminPermissionRoute permission="applications" />}>
//                       <Route path="StudentAdmin" element={<Students_Admin />} />
//                       <Route path="Student_View_Form/:id" element={<Student_View_Form />} />
//                       <Route path="Student_View_Form" element={<Student_View_Form />} />
//                       <Route path="/admin/Student_Profile/:id" element={<StudentProfile />} />
//                     </Route>

//                     {/* All route handling verified under "universities" access levels */}
//                     <Route element={<AdminPermissionRoute permission="universities" />}>
//                       <Route path="UniversityAdmin" element={<University_Admin />} />
//                       <Route path="ComparisonAdmin" element={<CountryComparisonForm />} />
//                       <Route path="EditUniversityForm/:id" element={<EditUniversityAdmin />} />
//                       <Route path="EditUniversityForm" element={<EditUniversityAdmin />} />
//                       <Route path="add-university" element={<AddUniversityAdmin />} />
//                       <Route path="edit-university/:id" element={<EditUniversityAdmin />} />
//                       <Route path="edit-university" element={<EditUniversityAdmin />} />
//                       <Route path="university/:universityId/programs" element={<UniversityProgramsAdmin />} />
//                       <Route path="program/:id/view" element={<ProgramViewAdmin />} />
//                       <Route path="UniversityProgramDetail/:universityId" element={<ProgramDetailCard />} />
//                       <Route path="UniversityProgramDetail" element={<ProgramDetailCard />} />
//                       <Route path="ProgramsAdminDetail/:id" element={<ProgramForm isEdit={true} />} />
//                       <Route path="ProgramsAdminDetail" element={<ProgramForm isEdit={false} />} />
//                     </Route>
//                   </Route>
//                 </Route>

//                 <Route path="*" element={<NotFound />} />
//               </Routes>
//             </Suspense>

//             <ContactModal isOpen={isModalOpen} onClose={closeModal} />
//           </Router>
//         </AuthProvider>
//       </ErrorBoundary>
//     </div>
//   );
// }

// export default App;



  import './App.css';
import { lazy, Suspense, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import {AuthProvider}  from './Context/AuthContext';
import ErrorBoundary from './Components/ClientSide/ErrorBoundary';
import PageLoader from './Components/ClientSide/PageLoader';
import AdminRoute from './Components/ClientSide/AdminRoute';
import UserRoute from './Components/ClientSide/UserRoute';
import AdminPermissionRoute from './Components/ClientSide/AdminPermissionRoute';
import UserLayout from './Components/ClientSide/UserLayout';
import AdminLayout from './Components/ClientSide/AdminLayout';
import UserAccountLayout from './Components/ClientSide/UserAccountLayout';
import ContactModal from './Components/ClientSide/Contact_Us';
import AuthSuccess from './Components/ClientSide/AuthSuccess'; 
import StudentProfile from './Components/ClientSide/StudentProfile';


const Home = lazy(() => import('./Components/ClientSide/Home'));
const Programs_List = lazy(() => import('./Components/ClientSide/Programs_List'));
const Universities_List = lazy(() => import('./Components/ClientSide/Universities_List'));
const Universities_Comparisons = lazy(() => import('./Components/ClientSide/Universities_Comparisons'));
const AuthPage = lazy(() => import('./Components/ClientSide/Auth'));
const GlobalSearch = lazy(() => import('./Components/ClientSide/GlobalSearch'));
const NotFound = lazy(() => import('./Components/ClientSide/NotFound'));
const UserDashboard = lazy(() => import('./Components/ClientSide/UserDashboard'));
const UserApplications = lazy(() => import('./Components/ClientSide/UserApplications'));
const UserProfile = lazy(() => import('./Components/ClientSide/UserProfile'));
const UserApplicationView = lazy(() => import('./Components/ClientSide/UserApplicationView'));
const ApplyViaUsWizard = lazy(() => import('./Components/ClientSide/ApplyViaUsWizard'));
const Admin_Panel = lazy(() => import('./Components/ClientSide/Admin_Panel'));
const University_Admin = lazy(() => import('./Components/ClientSide/University_Admin'));
const Students_Admin = lazy(() => import('./Components/ClientSide/Students_Admin'));
const Student_View_Form = lazy(() => import('./Components/ClientSide/Student_View_Form'));
const EditUniversityAdmin = lazy(() => import('./Components/ClientSide/EditUniversityAdmin'));
const AddUniversityAdmin = lazy(() => import('./Components/ClientSide/AddUniversityAdmin'));
const ProgramForm = lazy(() => import('./Components/ClientSide/AddProgramAdmin'));
const UniversityProgramsAdmin = lazy(() => import('./Components/ClientSide/UniversityProgramsAdmin'));
const ProgramViewAdmin = lazy(() => import('./Components/ClientSide/ProgramViewAdmin'));
const ProgramDetailCard = lazy(() => import('./Components/ClientSide/UniversityProgramDetail'));
const AdminTeam = lazy(() => import('./Components/ClientSide/AdminTeam'));

const CountryComparisonForm = lazy(() => import('./Components/ClientSide/CountryComparisonForm'));

const LazyFallback = () => <PageLoader label="Loading..." />;

const LegacyApplyRedirect = () => {
  const { programId } = useParams();
  return <Navigate to={`/user/apply/${programId}`} replace />;
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="App">
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <Suspense fallback={<LazyFallback />}>
              <Routes>
                {/* Global redirects to admin matching root layout structures */}
                <Route path="/AdminPanel" element={<Navigate to="/admin/AdminPanel" replace />} />
                <Route path="/UniversityAdmin" element={<Navigate to="/admin/UniversityAdmin" replace />} />
                <Route path="/StudentAdmin" element={<Navigate to="/admin/StudentAdmin" replace />} />
                <Route path="/Student_View_Form" element={<Navigate to="/admin/Student_View_Form" replace />} />
                <Route path="/EditUniversityForm" element={<Navigate to="/admin/EditUniversityForm" replace />} />
                <Route path="/add-university" element={<Navigate to="/admin/add-university" replace />} />
                <Route path="/edit-university" element={<Navigate to="/admin/edit-university" replace />} />
                <Route path="/UniversityProgramDetail" element={<Navigate to="/admin/UniversityProgramDetail" replace />} />

                <Route element={<UserLayout onContactClick={openModal} />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/Programs_List" element={<Programs_List onContactClick={openModal} />} />
                  <Route path="/Universities_List" element={<Universities_List onContactClick={openModal} />} />
                  <Route path="/University_Comparisons" element={<Universities_Comparisons onContactClick={openModal} />} />
                  <Route path="/Search" element={<GlobalSearch />} />
                  <Route path="/Login_Page" element={<AuthPage />} />
                  <Route path="/auth-success" element={<AuthSuccess />} />
                  <Route path="/ApplyViaUs/:programId" element={<LegacyApplyRedirect />} />
                  <Route path="/ApplyViaUs" element={<Navigate to="/Programs_List" replace />} />

                  <Route path="/user" element={<UserRoute />}>
                    <Route element={<UserAccountLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="profile" element={<UserProfile />} />
                      <Route path="dashboard" element={<UserDashboard />} />
                      <Route path="applications" element={<UserApplications />} />
                      <Route path="applications/:id" element={<UserApplicationView />} />

                      <Route path="apply" element={<Navigate to="/Programs_List" replace />} />
                      <Route path="apply/:programId" element={<ApplyViaUsWizard />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="/admin" element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="AdminPanel" replace />} />
                    <Route path="AdminPanel" element={<Admin_Panel />} />

                    <Route element={<AdminPermissionRoute permission="manageTeam" />}>
                      <Route path="team" element={<AdminTeam />} />
                    </Route>

                    <Route element={<AdminPermissionRoute permission="applications" />}>
                      <Route path="StudentAdmin" element={<Students_Admin />} />
                      <Route path="Student_View_Form/:id" element={<Student_View_Form />} />
                      <Route path="Student_View_Form" element={<Student_View_Form />} />
                      <Route path="/admin/Student_Profile/:id" element={<StudentProfile />} />
                    </Route>

                    {/* All route handling verified under "universities" access levels */}
                    <Route element={<AdminPermissionRoute permission="universities" />}>
                      <Route path="UniversityAdmin" element={<University_Admin />} />
                      <Route path="ComparisonAdmin" element={<CountryComparisonForm />} />
                      <Route path="EditUniversityForm/:id" element={<EditUniversityAdmin />} />
                      <Route path="EditUniversityForm" element={<EditUniversityAdmin />} />
                      <Route path="add-university" element={<AddUniversityAdmin />} />
                      <Route path="edit-university/:id" element={<EditUniversityAdmin />} />
                      <Route path="edit-university" element={<EditUniversityAdmin />} />
                      <Route path="university/:universityId/programs" element={<UniversityProgramsAdmin />} />
                      <Route path="program/:id/view" element={<ProgramViewAdmin />} />
                      <Route path="UniversityProgramDetail/:universityId" element={<ProgramDetailCard />} />
                      <Route path="UniversityProgramDetail" element={<ProgramDetailCard />} />
                      <Route path="ProgramsAdminDetail/:id" element={<ProgramForm isEdit={true} />} />
                      <Route path="ProgramsAdminDetail" element={<ProgramForm isEdit={false} />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>

            <ContactModal isOpen={isModalOpen} onClose={closeModal} />
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;