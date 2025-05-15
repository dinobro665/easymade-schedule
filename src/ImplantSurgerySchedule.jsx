import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { firestore as db } from "./firebase-config";

export default function ImplantSurgerySchedule() {
  const today = new Date().toISOString().split("T")[0];
  const [allSchedules, setAllSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({ date: "", patient: "", surgeryArea: "", quantity: "", status: "요청됨" });
  const [activeTab, setActiveTab] = useState("현재 일정");
  const [selectedIds, setSelectedIds] = useState([]);
  const [editCache, setEditCache] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "schedules"), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAllSchedules(fetched);
    });
    return () => unsubscribe();
  }, []);

  const updateField = async (id, field, value) => {
    await updateDoc(doc(db, "schedules", id), { [field]: value });
  };

  const updateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, "schedules", id), { status: newStatus });
  };

  const deleteSchedule = async (id) => {
    await deleteDoc(doc(db, "schedules", id));
  };

  const deleteSelectedSchedules = async () => {
    await Promise.all(selectedIds.map((id) => deleteSchedule(id)));
    setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const getRowColor = (status) => {
    switch (status) {
      case "요청됨": return "bg-yellow-100";
      case "설계 진행": return "bg-yellow-150";
      case "설계 중": return "bg-yellow-200";
      case "컨펌 요청": return "bg-yellow-300";
      case "제작 중": return "bg-yellow-400";
      case "수술 완료": return "bg-green-100";
      case "수술 연기": return "bg-gray-200";
      default: return "";
    }
  };

  const renderEditableCell = (schedule, field, tabType) => {
    const value = schedule[field];
    const isDate = field === "date";
    return (
      <div onDoubleClick={() => tabType !== "complete" && setEditCache({ ...editCache, [schedule.id + field]: true })} className="text-center">
        {editCache[schedule.id + field] ? (
          <Input
            autoFocus
            type={isDate ? "date" : field === "quantity" ? "number" : "text"}
            value={value}
            min={isDate ? today : undefined}
            onChange={(e) => updateField(schedule.id, field, isDate ? e.target.value : field === "quantity" ? Number(e.target.value) : e.target.value)}
            onBlur={() => setEditCache({ ...editCache, [schedule.id + field]: false })}
            className="text-center"
          />
        ) : (
          <span>{value}</span>
        )}
      </div>
    );
  };

  const renderScheduleTable = (items, tabType = "default") => {
    const sortedItems = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
      <>
        <Table className="text-center">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center"></TableHead>
              <TableHead className="text-center">수술 날짜</TableHead>
              <TableHead className="text-center">병원명</TableHead>
              <TableHead className="text-center">환자 이름</TableHead>
              <TableHead className="text-center">수술 부위</TableHead>
              <TableHead className="text-center">수량</TableHead>
              <TableHead className="text-center">{tabType === "complete" ? "" : "진행 상태"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((schedule) => (
              <TableRow key={schedule.id} className={`transition-colors ${getRowColor(schedule.status)}`}>
                <TableCell className="text-center">
                  <Checkbox checked={selectedIds.includes(schedule.id)} onCheckedChange={() => toggleSelect(schedule.id)} className="cursor-pointer" />
                </TableCell>
                <TableCell className="text-center">{renderEditableCell(schedule, "date", tabType)}</TableCell>
                <TableCell className="text-center">{schedule.hospital}</TableCell>
                <TableCell className="text-center">{renderEditableCell(schedule, "patient", tabType)}</TableCell>
                <TableCell className="text-center">{renderEditableCell(schedule, "surgeryArea", tabType)}</TableCell>
                <TableCell className="text-center">{renderEditableCell(schedule, "quantity", tabType)}</TableCell>
                <TableCell className="text-center">
                  {tabType === "complete" ? null : (
                    <div className="flex flex-col gap-2">
                      {tabType === "design" ? (
                        <>
                          <Select value={schedule.status} onValueChange={(value) => updateStatus(schedule.id, value)}>
                            <SelectTrigger><SelectValue placeholder="진행 상태 선택" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="설계 중">설계 중</SelectItem>
                              <SelectItem value="컨펌 요청">컨펌 요청</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="secondary" size="sm" onClick={() => updateStatus(schedule.id, "제작 중")}>출력 의뢰</Button>
                        </>
                      ) : tabType === "printing" ? (
                        <Button variant="secondary" size="sm" onClick={() => updateStatus(schedule.id, "수술 완료")}>수술 완료</Button>
                      ) : (
                        <>
                          <Select value={schedule.status} onValueChange={(value) => updateStatus(schedule.id, value)}>
                            <SelectTrigger><SelectValue placeholder="진행 상태 선택" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="요청됨">요청됨</SelectItem>
                              <SelectItem value="수술 연기">수술 연기</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="secondary" size="sm" onClick={() => updateStatus(schedule.id, "설계 진행")}>설계 진행</Button>
                        </>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {selectedIds.length > 0 && (
          <div className="mt-4 text-right">
            <Select onValueChange={(value) => {
  if (value === "일정 삭제") {
    deleteSelectedSchedules();
    return;
  }

  if (value.startsWith("move-")) {
    const label = value.replace("move-", "");
    const targetStatus =
      label === "현재 일정" ? "요청됨" :
      label === "설계 중 일정" ? "설계 진행" :
      label === "출력 중 일정" ? "제작 중" :
      label === "수술 완료/연기 일정" ? "수술 연기" : null;

    if (targetStatus) {
      selectedIds.forEach((id) => updateStatus(id, targetStatus));
      setSelectedIds([]);
      setActiveTab(label);
    }
  }

  if (value.startsWith("tab-")) {
    const label = value.replace("tab-", "");
    setActiveTab(label);
  }
}}
>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="선택 작업" />
              </SelectTrigger>
             <SelectContent>
  <SelectItem value="move-현재 일정">현재 일정으로 이동</SelectItem>
  <SelectItem value="move-설계 중 일정">설계 중 일정으로 이동</SelectItem>
  <SelectItem value="move-출력 중 일정">출력 중 일정으로 이동</SelectItem>
  <SelectItem value="move-수술 완료/연기 일정">수술 완료/연기 일정으로 이동</SelectItem>
  <SelectItem value="tab-현재 일정">현재 일정 탭 보기</SelectItem>
  <SelectItem value="tab-설계 중 일정">설계 중 탭 보기</SelectItem>
  <SelectItem value="tab-출력 중 일정">출력 중 탭 보기</SelectItem>
  <SelectItem value="tab-수술 완료/연기 일정">수술 완료/연기 탭 보기</SelectItem>
  <SelectItem value="일정 삭제">선택 일정 삭제</SelectItem>
</SelectContent>

            </Select>
          </div>
        )}
      </>
    );
  };

  const requested = allSchedules.filter((s) => s.status === "요청됨");
  const design = allSchedules.filter((s) => ["설계 진행", "설계 중", "컨펌 요청"].includes(s.status));
  const printing = allSchedules.filter((s) => s.status === "제작 중");
  const canceled = allSchedules.filter((s) => s.status === "수술 연기");
  const completed = allSchedules.filter((s) => s.status === "수술 완료");

const tabClass = (label) =>
  `px-4 py-2 rounded-md border text-sm font-semibold transition-all duration-150 ${
    activeTab === label
      ? "bg-black text-white shadow-md scale-120"
      : "bg-white text-gray-800 hover:bg-yellow-100"
  }`;


 return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4 tracking-tight">EASYMADE CF 수술일정 관리</h1>
      <div className="flex space-x-4 mb-6">
        <button className={tabClass("현재 일정")} onClick={() => setActiveTab("현재 일정")}>현재 일정</button>
        <button className={tabClass("설계 중 일정")} onClick={() => setActiveTab("설계 중 일정")}>설계 중 일정</button>
        <button className={tabClass("출력 중 일정")} onClick={() => setActiveTab("출력 중 일정")}>출력 중 일정</button>
        <button className={tabClass("수술 완료/연기 일정")} onClick={() => setActiveTab("수술 완료/연기 일정")}>수술 완료/연기 일정</button>
      </div>

      {activeTab === "현재 일정" && (
        <>
          <h2 className="text-lg font-semibold mb-4">신규 의뢰</h2>
          <div className="pb-6 mb-10">
            <Card>
              <CardContent className="p-4 grid grid-cols-6 gap-4">
  <Select onValueChange={(value) => setNewSchedule({ ...newSchedule, hospital: value })}>
    <SelectTrigger>
      <SelectValue placeholder="병원명 선택" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="중앙대학병원 구강악안면외과">중앙대학병원 구강악안면외과</SelectItem>
      <SelectItem value="신촌세브란스병원 성형외과">신촌세브란스병원 성형외과</SelectItem>
      <SelectItem value="동탄성심병원 성형외과">동탄성심병원 성형외과</SelectItem>
      <SelectItem value="서울아산병원 성형외과">서울아산병원 성형외과</SelectItem>
    </SelectContent>
  </Select>

  <Input type="date" value={newSchedule.date} min={today} onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })} />
  <Input type="text" value={newSchedule.patient} onChange={(e) => setNewSchedule({ ...newSchedule, patient: e.target.value })} placeholder="환자 이름" />
  <Input type="text" value={newSchedule.surgeryArea} onChange={(e) => setNewSchedule({ ...newSchedule, surgeryArea: e.target.value })} placeholder="수술 부위" />
  <Input type="number" min="1" value={newSchedule.quantity} onChange={(e) => setNewSchedule({ ...newSchedule, quantity: e.target.value })} placeholder="수량" />
  <Button
    onClick={async () => {
      if (!newSchedule.hospital || !newSchedule.date || !newSchedule.patient || !newSchedule.surgeryArea || !newSchedule.quantity) return;
      await addDoc(collection(db, "schedules"), {
        confirmDeadline: "",
        ...newSchedule,
      });
      setNewSchedule({ hospital: "", date: "", patient: "", surgeryArea: "", quantity: "", status: "요청됨" });
    }}
  >
    일정 추가
  </Button>
</CardContent>

            </Card>
          </div>
          <h2 className="text-lg font-semibold mb-2">현재 진행 일정</h2>
          <div className="mt-4">{renderScheduleTable(requested)}</div>
                  </>
      )}

      {activeTab === "설계 중 일정" && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-2">설계 중/컨펌 요청 일정</h2>
          {renderScheduleTable(design, "design")}
        </div>
      )}

      {activeTab === "출력 중 일정" && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-2">제작 중 일정</h2>
          {renderScheduleTable(printing, "printing")}
        </div>
      )}

      {activeTab === "수술 완료/연기 일정" && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-2">수술 완료 일정</h2>
          {renderScheduleTable(completed, "complete")}
          <h2 className="text-lg font-semibold mt-8 mb-2">수술 연기 일정</h2>
          {renderScheduleTable(canceled, "complete")}
        </div>

        
      )}
    </div>
  );
}
