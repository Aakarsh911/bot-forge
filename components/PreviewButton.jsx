import React, { useContext } from 'react';
import { Button, ConfigProvider, Space } from 'antd';
import { AntDesignOutlined } from '@ant-design/icons';
import { css } from '@emotion/css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye} from '@fortawesome/free-solid-svg-icons';
import { useRouter, useParams } from 'next/navigation';

export const PreviewButton = () => {
    const router = useRouter();
    const params = useParams();
    const botId = params.botId;
    const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
    const rootPrefixCls = getPrefixCls();
    const linearGradientButton = css`
    &.${rootPrefixCls}-btn-primary:not([disabled]):not(.${rootPrefixCls}-btn-dangerous) {
      border-width: 0;

      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: 0;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
        
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `;

    const handlePreview = () => {
      console.log('Previewing bot:', botId);
      router.push(`/sample-page/${botId}`);
    }

    return (
        <ConfigProvider
            button={{
                className: linearGradientButton,
            }}
        >
            <Space>
                <Button type="primary" size="medium" onClick={handlePreview} icon={<FontAwesomeIcon icon={faEye} className="eye-icon" />}>
                    Live Preview
                </Button>
            </Space>
        </ConfigProvider>
    );
};
