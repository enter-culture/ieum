"use client";
import { useRef, useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/shared/lib/auth-store";
import { getMe, updateMe, uploadImage, type MyProfile } from "@/shared/api/users";

const ORANGE = "#ee7f12";

export default function ProfilePage() {
  const { isLoggedIn, login, logout, user } = useAuth();
  const { data: profile, mutate, isLoading } = useSWR<MyProfile>(
    isLoggedIn ? "/users/me" : null,
    getMe,
  );

  if (!isLoggedIn) return <LoggedOut onLogin={login} />;

  return (
    <div className="h-dvh overflow-y-auto bg-white pb-24">
      <div className="px-5 pt-12 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">프로필</h1>
      </div>

      {isLoading || !profile ? (
        <div className="flex items-center justify-center py-24 text-sm text-gray-300">
          불러오는 중…
        </div>
      ) : (
        <ProfileBody
          profile={profile}
          fallbackPicture={user?.picture}
          onSaved={(updated) => mutate(updated, { revalidate: false })}
          onLogout={logout}
        />
      )}
    </div>
  );
}

function ProfileBody({
  profile,
  fallbackPicture,
  onSaved,
  onLogout,
}: {
  profile: MyProfile;
  fallbackPicture?: string;
  onSaved: (updated: MyProfile) => void;
  onLogout: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ProfileEditor
        profile={profile}
        fallbackPicture={fallbackPicture}
        onCancel={() => setEditing(false)}
        onSaved={(updated) => {
          onSaved(updated);
          setEditing(false);
        }}
      />
    );
  }

  const avatar = profile.picture || fallbackPicture;
  const displayName = profile.nickname || profile.name;

  return (
    <div className="px-5 py-8">
      {/* 아바타 + 이름 */}
      <div className="flex flex-col items-center">
        <Avatar src={avatar} name={displayName} size={96} />
        <p className="mt-4 text-lg font-bold text-gray-900">{displayName}</p>
        <p className="text-sm text-gray-400">{profile.email}</p>
      </div>

      {/* 정보 카드 */}
      <div className="mt-8 space-y-3">
        <InfoRow label="닉네임" value={profile.nickname} />
        <InfoRow label="관심 지역" value={profile.region} />
        <InfoRow label="관심 카테고리" value={profile.category} />
      </div>

      {/* 액션 */}
      <button
        onClick={() => setEditing(true)}
        className="mt-8 w-full rounded-xl py-3.5 text-sm font-semibold text-white"
        style={{ background: ORANGE }}
      >
        프로필 수정
      </button>
      <button
        onClick={onLogout}
        className="mt-3 w-full rounded-xl border border-gray-200 py-3.5 text-sm font-medium text-gray-500"
      >
        로그아웃
      </button>
    </div>
  );
}

function ProfileEditor({
  profile,
  fallbackPicture,
  onCancel,
  onSaved,
}: {
  profile: MyProfile;
  fallbackPicture?: string;
  onCancel: () => void;
  onSaved: (updated: MyProfile) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [picture, setPicture] = useState<string | null>(profile.picture);
  const [nickname, setNickname] = useState(profile.nickname ?? "");
  const [region, setRegion] = useState(profile.region ?? "");
  const [category, setCategory] = useState(profile.category ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setPicture(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "사진 업로드 실패");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      const updated = await updateMe({
        nickname: nickname.trim(),
        region: region.trim(),
        category: category.trim(),
        ...(picture ? { picture } : {}),
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
      setSaving(false);
    }
  };

  const avatar = picture || fallbackPicture;

  return (
    <div className="px-5 py-8">
      {/* 사진 변경 */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative"
          disabled={uploading}
        >
          <Avatar src={avatar} name={nickname || profile.name} size={96} />
          <span
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md"
            style={{ background: ORANGE }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={pickPhoto}
        />
        <p className="mt-3 text-xs text-gray-400">
          {uploading ? "업로드 중…" : "사진을 눌러 변경"}
        </p>
      </div>

      {/* 입력 폼 */}
      <div className="mt-8 space-y-5">
        <Field label="닉네임" value={nickname} onChange={setNickname} placeholder={profile.name} />
        <Field label="관심 지역" value={region} onChange={setRegion} placeholder="예: 전주" />
        <Field label="관심 카테고리" value={category} onChange={setCategory} placeholder="예: 공예" />
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* 액션 */}
      <button
        onClick={save}
        disabled={saving || uploading}
        className="mt-8 w-full rounded-xl py-3.5 text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: ORANGE }}
      >
        {saving ? "저장 중…" : "저장"}
      </button>
      <button
        onClick={onCancel}
        disabled={saving}
        className="mt-3 w-full rounded-xl border border-gray-200 py-3.5 text-sm font-medium text-gray-500"
      >
        취소
      </button>
    </div>
  );
}

function Avatar({ src, name, size }: { src?: string | null; name: string; size: number }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover bg-gray-100"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold"
      style={{ width: size, height: size, background: ORANGE, fontSize: size / 2.5 }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3.5">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900">
        {value || <span className="text-gray-300">미설정</span>}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-gray-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={40}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#ee7f12]"
      />
    </label>
  );
}

function LoggedOut({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-white px-8 pb-24 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "rgba(238,127,18,0.1)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <h2 className="mt-5 text-lg font-bold text-gray-900">로그인이 필요해요</h2>
      <p className="mt-2 text-sm text-gray-400">
        로그인하고 나만의 프로필을 만들어보세요
      </p>
      <button
        onClick={onLogin}
        className="mt-6 w-full max-w-xs rounded-xl py-3.5 text-sm font-semibold text-white"
        style={{ background: ORANGE }}
      >
        구글로 로그인
      </button>
    </div>
  );
}
