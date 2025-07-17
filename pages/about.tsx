import React, { useContext } from 'react'
import { FiTarget, FiUsers, FiTrendingUp, FiShield } from 'react-icons/fi'
import { LanguageContext } from './_app'

export default function About() {
  const { language } = useContext(LanguageContext);

  const content = {
    en: {
      title: "About Us",
      subtitle: "Learn about Esen Global Investment",
      mission: "Our Mission",
      missionText: "As Esen Global Investment, we aim to help investors make informed investment decisions by providing portfolio management, market analysis, and real-time trading tracking services through the Interactive Brokers platform.",
      vision: "Our Vision",
      visionText: "To become the most trusted and preferred portfolio tracking and analysis platform for individual investors in Turkey, combining our technology and expertise to provide the best experience to our investors.",
      expertTeam: "Expert Team",
      expertTeamText: "With our expert team having years of experience in financial markets, we provide you with the most current and accurate information.",
      security: "Security",
      securityText: "Your data is protected with SSL certificates and industry-standard encryption technologies.",
      realTimeData: "Real-Time Data",
      realTimeDataText: "Thanks to direct integration with Interactive Brokers, you can track your portfolio in real-time.",
      customerFocused: "Customer Focused",
      customerFocusedText: "Customer satisfaction is our priority. We are here for all your questions and support needs.",
      contactInfo: "Contact Information",
      address: "Address",
      email: "Email",
      website: "Website",
      responsiblePerson: "Responsible Person"
    },
    tr: {
      title: "Hakkımızda",
      subtitle: "Esen Global Investment hakkında bilgi edinin",
      mission: "Misyonumuz",
      missionText: "Esen Global Investment olarak, yatırımcılara Interactive Brokers platformu üzerinden portföy yönetimi, piyasa analizi ve gerçek zamanlı alım-satım takibi hizmetleri sunarak, bilinçli yatırım kararları almalarına yardımcı olmayı amaçlıyoruz.",
      vision: "Vizyonumuz",
      visionText: "Türkiye'de bireysel yatırımcıların en güvendiği ve tercih ettiği portföy takip ve analiz platformu olmak, teknoloji ve uzmanlığımızı birleştirerek yatırımcılarımıza en iyi deneyimi sunmak.",
      expertTeam: "Uzman Ekip",
      expertTeamText: "Finansal piyasalarda yılların deneyimine sahip uzman ekibimizle, size en güncel ve doğru bilgileri sunuyoruz.",
      security: "Güvenlik",
      securityText: "Verileriniz SSL sertifikası ve endüstri standardı şifreleme teknolojileri ile korunmaktadır.",
      realTimeData: "Gerçek Zamanlı Veriler",
      realTimeDataText: "Interactive Brokers ile doğrudan entegrasyon sayesinde portföyünüzü gerçek zamanlı takip edebilirsiniz.",
      customerFocused: "Müşteri Odaklı",
      customerFocusedText: "Müşteri memnuniyeti bizim için öncelik. Her türlü soru ve desteğiniz için yanınızdayız.",
      contactInfo: "İletişim Bilgileri",
      address: "Adres",
      email: "E-posta",
      website: "Website",
      responsiblePerson: "Sorumlu Kişi"
    }
  };

  const t = content[language as keyof typeof content] || content.en;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
          <p className="text-gray-600">
            {t.subtitle}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">{t.mission}</h2>
              <p className="text-gray-700">
                {t.missionText}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">{t.vision}</h2>
              <p className="text-gray-700">
                {t.visionText}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start mb-4">
              <div className="bg-primary-100 p-3 rounded-full mr-4">
                <FiTarget className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t.expertTeam}</h3>
                <p className="text-gray-600">
                  {t.expertTeamText}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FiShield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t.security}</h3>
                <p className="text-gray-600">
                  {t.securityText}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start mb-4">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <FiTrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t.realTimeData}</h3>
                <p className="text-gray-600">
                  {t.realTimeDataText}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start mb-4">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FiUsers className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t.customerFocused}</h3>
                <p className="text-gray-600">
                  {t.customerFocusedText}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-6">{t.contactInfo}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">{t.address}</h3>
              <p className="text-gray-700">
                CUMHURİYET MAH. ATATÜRK BULVARI<br />
                No:186 /Z01 Kapı No: 05500<br />
                SULUOVA/ Amasya / Türkiye
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">{t.email}</h3>
              <p className="text-gray-700">esenglobal@esenglobalinvest.com</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">{t.website}</h3>
              <p className="text-gray-700">https://esenglobalinvest.com</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">{t.responsiblePerson}</h3>
              <p className="text-gray-700">Mustafa Esen</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 