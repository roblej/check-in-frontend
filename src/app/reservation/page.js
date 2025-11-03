import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReservationClient from "./ReservationClient";

export default function ReservationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ReservationClient />
      <Footer />
    </div>
  );
}
