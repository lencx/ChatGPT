import { useEffect, ForwardRefRenderFunction, useImperativeHandle, forwardRef } from 'react';
import { Form, Input, Switch } from 'antd';
import type { FormProps } from 'antd';

import Tags from '@comps/Tags';
import { DISABLE_AUTO_COMPLETE } from '@/utils';

interface LanguageModelProps {
  record?: Record<string|symbol, any> | null;
}

const initFormValue = {
  act: '',
  enable: true,
  tags: [],
  prompt: '',
};

const LanguageModel: ForwardRefRenderFunction<FormProps, LanguageModelProps> = ({ record }, ref) => {
  const [form] = Form.useForm();
  useImperativeHandle(ref, () => ({ form }));

  useEffect(() => {
    if (record) {
      form.setFieldsValue(record);
    }
  }, [record]);

  return (
    <Form
      form={form}
      labelCol={{ span: 4 }}
      initialValues={initFormValue}
    >
      <Form.Item
        label="/{cmd}"
        name="cmd"
        rules={[{ required: true, message: 'Please input {cmd}!' }]}
      >
        <Input placeholder="Please input {cmd}" {...DISABLE_AUTO_COMPLETE} />
      </Form.Item>
      <Form.Item
        label="Act"
        name="act"
        rules={[{ required: true, message: 'Please input act!' }]}
      >
        <Input placeholder="Please input act" {...DISABLE_AUTO_COMPLETE} />
      </Form.Item>
      <Form.Item label="Tags" name="tags">
        <Tags />
      </Form.Item>
      <Form.Item label="Enable" name="enable" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item
        label="Prompt"
        name="prompt"
        rules={[{ required: true, message: 'Please input prompt!' }]}
      >
        <Input.TextArea rows={4} placeholder="Please input prompt" {...DISABLE_AUTO_COMPLETE} />
      </Form.Item>
    </Form>
  )
}

export default forwardRef(LanguageModel);
