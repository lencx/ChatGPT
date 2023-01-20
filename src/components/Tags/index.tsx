import { FC, useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Input, Tag } from 'antd';
import type { InputRef } from 'antd';

import { DISABLE_AUTO_COMPLETE } from '@/utils';

interface TagsProps {
  value?: string[];
  onChange?: (v: string[]) => void;
  addTxt?: string;
  max?: number;
}

const Tags: FC<TagsProps> = ({ max = 99, value = [], onChange, addTxt = 'New Tag' }) => {
  const [tags, setTags] = useState<string[]>(value);
  const [inputVisible, setInputVisible] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    setTags(value);
  }, [value])

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && tags.indexOf(inputValue) === -1) {
      const val = [...tags, inputValue];
      setTags(val);
      onChange && onChange(val);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const forMap = (tag: string) => {
    const tagElem = (
      <Tag
        closable
        onClose={(e) => {
          e.preventDefault();
          handleClose(tag);
        }}
      >
        {tag}
      </Tag>
    );
    return (
      <span key={tag} style={{ display: 'inline-block' }}>
        {tagElem}
      </span>
    );
  };

  const tagChild = tags.map(forMap);

  return (
    <>
      <span style={{ marginBottom: 16 }}>{tagChild}</span>
      {inputVisible && (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={{ width: 78 }}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
          {...DISABLE_AUTO_COMPLETE}
        />
      )}
      {!inputVisible && tags.length < max && (
        <Tag onClick={showInput} className="chat-tag-new">
          <PlusOutlined /> {addTxt}
        </Tag>
      )}
    </>
  );
};

export default Tags;