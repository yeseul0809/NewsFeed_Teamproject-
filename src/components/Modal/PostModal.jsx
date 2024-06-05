import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/Auth/hooks';
import { useDispatch } from 'react-redux';
import { closeModal } from '../../Redux/Slices/PostModalSlice';

export default function PostModal() {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImgFile, setPostImgFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const dispatch = useDispatch();
  const { session, supabaseClient } = useAuth();

  const handleImageChange = (event) => {
    const fileObj = event.target.files[0];
    setPostImgFile(fileObj);
    const objectUrl = URL.createObjectURL(fileObj);
    setPreviewUrl(objectUrl);
  };

  async function handlePost(e) {
    e.preventDefault();
    const { data: imgData, error: imgError } = await supabaseClient.storage
      .from('posts')
      .upload(`thumbnail/${Date.now()}`, postImgFile);

    if (imgError) {
      throw new Error(imgError);
    }

    const {
      data: { publicUrl }
    } = supabaseClient.storage.from('posts').getPublicUrl(imgData.path);

    const { error } = await supabaseClient.from('posts').insert({
      UID: session.user.user_metadata.userName,
      title: postTitle,
      content: postContent,
      img_url: publicUrl
    });

    if (error) {
      throw new Error(error);
    }

    alert('포스팅 완료!');
    dispatch(closeModal());
  }

  return (
    <StModalWrapper>
      <StFormWrapper onSubmit={handlePost}>
        <label htmlFor="postImage">
          <StPrevImgWrapper>
            {previewUrl ? (
              <img src={previewUrl} alt="미리보기 이미지" width={360} height={180} />
            ) : (
              <p>이미지 가져오기</p>
            )}
          </StPrevImgWrapper>
        </label>
        <StFileInput type="file" id="postImage" accept="image/*" onChange={handleImageChange} />
        <input
          type="text"
          value={postTitle}
          placeholder="제목을 입력해주세요."
          onChange={(e) => setPostTitle(e.target.value)}
        />
        <input
          type="text"
          value={postContent}
          placeholder="간략한 소개글을 작성해주세요."
          onChange={(e) => setPostContent(e.target.value)}
        />
        <button type="submit">포스팅하기</button>
        <button onClick={() => dispatch(closeModal())}>모달창 닫기</button>
      </StFormWrapper>
    </StModalWrapper>
  );
}

const StModalWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: 600px; /* 예시 크기 */
  height: 400px; /* 예시 크기 */
  padding: 20px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
`;

const StFormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background-color: #f8f9fa;
  padding: 32px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const StPrevImgWrapper = styled.div`
  width: 400px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  &:hover {
    opacity: 0.7;
  }
`;

const StFileInput = styled.input`
  display: none;
`;
