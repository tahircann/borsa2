import React from 'react'
import { FiTarget, FiUsers, FiTrendingUp, FiShield } from 'react-icons/fi'

export default function About() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Hakkımızda</h1>
        <p className="text-gray-600">
          Esen Global Investment hakkında bilgi edinin
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Misyonumuz</h2>
            <p className="text-gray-700">
              Esen Global Investment olarak, yatırımcılara Interactive Brokers platformu üzerinden portföy yönetimi, 
              piyasa analizi ve gerçek zamanlı alım-satım takibi hizmetleri sunarak, bilinçli yatırım kararları 
              almalarına yardımcı olmayı amaçlıyoruz.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Vizyonumuz</h2>
            <p className="text-gray-700">
              Türkiye'de bireysel yatırımcıların en güvendiği ve tercih ettiği portföy takip ve analiz platformu 
              olmak, teknoloji ve uzmanlığımızı birleştirerek yatırımcılarımıza en iyi deneyimi sunmak.
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
              <h3 className="text-lg font-semibold mb-2">Uzman Ekip</h3>
              <p className="text-gray-600">
                Finansal piyasalarda yılların deneyimine sahip uzman ekibimizle, 
                size en güncel ve doğru bilgileri sunuyoruz.
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
              <h3 className="text-lg font-semibold mb-2">Güvenlik</h3>
              <p className="text-gray-600">
                Verileriniz SSL sertifikası ve endüstri standardı şifreleme 
                teknolojileri ile korunmaktadır.
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
              <h3 className="text-lg font-semibold mb-2">Gerçek Zamanlı Veriler</h3>
              <p className="text-gray-600">
                Interactive Brokers ile doğrudan entegrasyon sayesinde 
                portföyünüzü gerçek zamanlı takip edebilirsiniz.
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
              <h3 className="text-lg font-semibold mb-2">Müşteri Odaklı</h3>
              <p className="text-gray-600">
                Müşteri memnuniyeti bizim için öncelik. Her türlü soru ve 
                desteğiniz için yanınızdayız.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-semibold mb-6">İletişim Bilgileri</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Adres</h3>
            <p className="text-gray-700">
              CUMHURİYET MAH. ATATÜRK BULVARI<br />
              No:186 /Z01 Kapı No: 05500<br />
              SULUOVA/ Amasya / Türkiye
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">E-posta</h3>
            <p className="text-gray-700">esenglobal@esenglobalinvest.com</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Website</h3>
            <p className="text-gray-700">https://esenglobalinvest.com</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Sorumlu Kişi</h3>
            <p className="text-gray-700">Mustafa Esen</p>
          </div>
        </div>
      </div>
    </>
  )
} 