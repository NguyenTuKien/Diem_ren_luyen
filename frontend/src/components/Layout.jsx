import Sidebar from './Sidebar'
import Header from './Header'

function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {children}
      </main>
    </div>
  )
}

export default Layout