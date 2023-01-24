import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Row, Col, Card } from 'antd';
import { os, invoke } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import useJson from '@/hooks/useJson';
import { CHAT_AWESOME_JSON, CHAT_CONF_JSON, readJSON } from '@/utils';
import './index.scss';

export default function Dashboard() {
  const { json } = useJson<Record<string, any>[]>(CHAT_AWESOME_JSON);
  const [list, setList] = useState<Array<[string, Record<string, any>[]]>>([]);
  const [hasClass, setClass] = useState(false);
  const [theme, setTheme] = useState('');

  useInit(async () => {
    const getOS = await os.platform();
    const conf = await readJSON(CHAT_CONF_JSON);
    const appTheme = await invoke('get_theme');
    setTheme(appTheme as string);
    setClass(!conf?.titlebar && getOS === 'darwin');
  });

  useEffect(() => {
    const categories = new Map();

    json?.forEach((i) => {
      if (!i.enable) return;
      if (!categories.has(i.category)) {
        categories.set(i.category, []);
      }
      categories.get(i?.category).push(i);
    });
    setList(Array.from(categories));
  }, [json?.length]);

  const handleLink = async (item: Record<string, any>) => {
    await invoke('wa_window', {
      label: btoa(item.url).replace(/[^a-zA-Z0-9]/g, ''),
      title: item.title,
      url: item.url,
    });
  };

  return (
    <div className={clsx('dashboard', theme, { 'has-top-dom': hasClass })}>
      <div>
        {list.map((i) => {
          return (
            <div key={i[0]} className="group-item">
              <Card title={i[0]} size="small">
                <Row className="list" gutter={[8, 8]}>
                  {i[1].map((j, idx) => {
                    return (
                      <Col
                        title={`${j?.title}: ${j?.url}`}
                        key={`${idx}_${j?.url}`}
                        xl={4}
                        md={6}
                        sm={8}
                        xs={12}
                      >
                        <Card className="item" hoverable onClick={() => handleLink(j)}>
                          <span>{j?.title}</span>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
