import React from 'react';

export default function GuideView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-4xl font-bold mb-2">📚 คู่มือการใช้งาน</h1>
        <p className="text-blue-100 text-lg">ระบบติดตามเอกสารกลุ่มบริหารงบประมาณ</p>
      </div>

      {/* Table of Contents */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">📑 สารบัญ</h2>
        <ul className="space-y-2 text-blue-600">
          <li><a href="#dashboard" className="hover:underline">📄 หน้าหลัก (Dashboard)</a></li>
          <li><a href="#documents" className="hover:underline">📄 จัดการเอกสาร</a></li>
          <li><a href="#permissions" className="hover:underline">🔒 การเข้าสู่ระบบและสิทธิ์การใช้งาน</a></li>
          <li><a href="#attachments" className="hover:underline">📎 การแนบไฟล์และการแจ้งเตือน</a></li>
          <li><a href="#statuses" className="hover:underline">📋 ตัวเลือกสถานะในระบบ</a></li>
          <li><a href="#contact" className="hover:underline">📞 ส่วนติดต่อผู้พัฒนาระบบ</a></li>
        </ul>
      </div>

      {/* Dashboard Section */}
      <div id="dashboard" className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 scroll-mt-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">📄</span> หน้าหลัก (Dashboard)
        </h2>
        <p className="text-slate-700 mb-4">
          เป็นหน้าแรกของระบบเมื่อเข้าสู่ระบบ แสดงภาพรวมข้อมูลสำคัญทั้งหมด ประกอบด้วย:
        </p>
        <ul className="space-y-3 text-slate-700">
          <li className="flex gap-3">
            <span className="text-blue-500 font-bold">•</span>
            <div>
              <strong>การ์ดสรุปสถิติ:</strong> แสดงจำนวนเอกสารทั้งหมด, เอกสารที่กำลังดำเนินการ, อนุมัติแล้ว, และไม่อนุมัติ
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-500 font-bold">•</span>
            <div>
              <strong>รายการเอกสาร:</strong> แสดงรายการเอกสารทั้งหมดในระบบ พร้อมเครื่องมือสำหรับค้นหาและกรองข้อมูล
            </div>
          </li>
        </ul>
      </div>

      {/* Documents Section */}
      <div id="documents" className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 scroll-mt-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">📄</span> จัดการเอกสาร
        </h2>
        <p className="text-slate-700 mb-6">
          หน้านี้ใช้สำหรับดูและค้นหาเอกสารทั้งหมดในระบบ มีเครื่องมือช่วยค้นหาโดยละเอียด ดังนี้:
        </p>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <strong className="text-blue-900 block mb-1">🔍 ช่องค้นหาหลัก</strong>
            <p className="text-slate-700 text-sm">ค้นหาข้อมูลได้อย่างรวดเร็วจาก เลขที่เอกสาร, ชื่อผู้เสนอ, หรือคำสำคัญในวัตถุประสงค์</p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <strong className="text-green-900 block mb-1">📅 ตัวกรองตามวันที่</strong>
            <p className="text-slate-700 text-sm">เลือกช่วงวันที่เริ่มต้นและสิ้นสุด เพื่อแสดงเอกสารที่ถูกส่งภายในช่วงเวลานั้นๆ</p>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <strong className="text-purple-900 block mb-1">🏷️ ตัวกรองตามกลุ่มสาระ</strong>
            <p className="text-slate-700 text-sm">เลือกกลุ่มสาระเพื่อจำกัดการแสดงผลเฉพาะเอกสารจากกลุ่มสาระนั้น</p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <strong className="text-yellow-900 block mb-1">👤 ตัวกรองตามชื่อผู้เสนอ</strong>
            <p className="text-slate-700 text-sm">สามารถเลือกชื่อผู้เสนอที่ต้องการเพื่อดูเอกสารของบุคคลนั้นๆ ได้</p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <strong className="text-red-900 block mb-1">✓ ตัวกรองตามสถานะอนุมัติ</strong>
            <p className="text-slate-700 text-sm">เลือกสถานะ (กำลังดำเนินการ, อนุมัติ, ไม่อนุมัติ) เพื่อดูเอกสารที่มีสถานะการอนุมัติสุดท้ายตามที่เลือก</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <strong className="text-blue-900">💡 เคล็ดลับ:</strong>
          <p className="text-blue-900 text-sm mt-2">
            คุณสามารถใช้ตัวกรองหลายๆ อย่างร่วมกันได้เพื่อการค้นหาที่แม่นยำยิ่งขึ้น และสามารถกดปุ่ม "รีเซ็ต" เพื่อกลับไปแสดงเอกสารทั้งหมดได้ตลอดเวลา
          </p>
        </div>
      </div>

      {/* Permissions Section */}
      <div id="permissions" className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 scroll-mt-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">🔒</span> การเข้าสู่ระบบและสิทธิ์การใช้งาน
        </h2>
        <p className="text-slate-700 mb-6">
          ระบบใช้ข้อมูลจากชีต 'users' ใน Google Sheet ของคุณในการยืนยันตัวตน โดยผู้ใช้ที่มีบทบาทเป็น 'admin' จะสามารถเข้าถึงฟังก์ชันการจัดการทั้งหมดได้ ซึ่งรวมถึง:
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <ul className="space-y-2 text-slate-700">
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">✓</span> เพิ่ม, แก้ไข, และลบเอกสาร
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">✓</span> จัดการข้อมูลบุคลากร
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">✓</span> ดูรายงานและสถิติทั้งหมด
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">✓</span> อนุมัติเอกสารขั้นสุดท้ายได้จากเมนู "รายงานอนุมัติ"
            </li>
          </ul>
        </div>
      </div>

      {/* Attachments Section */}
      <div id="attachments" className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 scroll-mt-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">📎</span> การแนบไฟล์และการแจ้งเตือน
        </h2>

        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">📎 การแนบไฟล์</h3>
            <p className="text-slate-700">
              ในหน้าเพิ่ม/แก้ไขเอกสาร สามารถแนบไฟล์ได้ โดยไฟล์ต้องมีขนาดไม่เกิน <strong>3MB</strong>
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">📧 การแจ้งเตือน</h3>
            <p className="text-slate-700 mb-3">
              เมื่อเอกสารได้รับการ "อนุมัติ" ระบบจะส่งอีเมลแจ้งเตือนไปยังผู้เสนอโดยอัตโนมัติ (หากมีการระบุอีเมลไว้ในหน้าจัดการบุคลากร)
            </p>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm text-slate-700">
              <strong>⚠️ หมายเหตุ:</strong> โปรดตรวจสอบให้แน่ใจว่าข้อมูลอีเมลของผู้เสนอถูกต้อง
            </div>
          </div>
        </div>
      </div>

      {/* Statuses Section */}
      <div id="statuses" className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 scroll-mt-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="text-3xl">📋</span> ตัวเลือกสถานะในระบบ
        </h2>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">สถานะ 4 ฝ่าย (Planning, Procurement, Finance, Budget):</h3>
          <div className="space-y-3">
            {[
              { icon: '⏳', status: 'กำลังดำเนินการ', desc: 'เอกสารอยู่ระหว่างการตรวจสอบในขั้นตอนต่างๆ' },
              { icon: '✅', status: 'ผ่านการตรวจสอบ', desc: 'เอกสารผ่านการตรวจสอบจากฝ่ายนี้แล้ว' },
              { icon: '⏭️', status: 'ข้ามขั้นตอนนี้', desc: 'เอกสารไม่จำเป็นต้องผ่านการตรวจสอบในแผนกนี้' },
              { icon: '⚠️', status: 'ไม่ผ่าน-แก้ไข', desc: 'เอกสารไม่ผ่านการตรวจสอบ ต้องมีการแก้ไข' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <strong className="text-slate-800 block">{item.status}</strong>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-slate-200 pt-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">สถานะอนุมัติสุดท้าย:</h3>
          <div className="space-y-3">
            {[
              { icon: '✔️', status: 'อนุมัติ', desc: 'เอกสารได้รับการอนุมัติขั้นสุดท้ายแล้ว' },
              { icon: '❌', status: 'ไม่อนุมัติ', desc: 'เอกสารไม่ได้รับการอนุมัติขั้นสุดท้าย' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <strong className="text-slate-800 block">{item.status}</strong>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border border-green-200 scroll-mt-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">📞</span> ส่วนติดต่อผู้พัฒนาระบบ
        </h2>
        <p className="text-slate-700 mb-6">
          หากพบปัญหาการใช้งานหรือต้องการคำแนะนำเพิ่มเติม ติดต่อทีมพัฒนา:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-green-200">
            <h3 className="font-bold text-slate-800 text-lg mb-2">👨‍💻 นายทักษิณพัฒน์ ศรีขวาชัย</h3>
            <p className="text-slate-600 flex items-center gap-2 mb-2">
              <span className="material-icons text-base">phone</span>
              086-2371771
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-green-200">
            <h3 className="font-bold text-slate-800 text-lg mb-2">👨‍💻 ศุภณันทเชษฐ์ สุขกุลพัชญ์</h3>
            <p className="text-slate-600 flex items-center gap-2">
              <span className="material-icons text-base">phone</span>
              085-4545104
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
          <p className="text-slate-600 text-sm">
            <span className="font-bold text-slate-800">💼 แผนก:</span> งานเทคโนโลยีสารสนเทศ (ICT)
          </p>
          <p className="text-slate-600 text-sm">
            <span className="font-bold text-slate-800">🏫 สถานที่ราชการ:</span> โรงเรียนสารคามพิทยาคม
          </p>
          <p className="text-slate-600 text-sm mt-2">
            © 2025 งานเทคโนโลยีสารสนเทศ (ICT) โรงเรียนสารคามพิทยาคม
          </p>
        </div>
      </div>
    </div>
  );
}
