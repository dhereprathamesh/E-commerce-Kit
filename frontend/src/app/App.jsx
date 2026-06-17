import Layout from "../components/layout/Layout";
import AppRoutes from "./routes";

export default function App() {
  console.log("App.js file");

  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}
