import { Button } from 'antd';
import React from 'react';
import { useColor, useTheme } from '@/store';

export default function () {
  const { changeTheme } = useTheme();
  const [primaryColor] = useColor(['primary-color']);

  const onBtnClick = () => {
    changeTheme();
  };

  return (
    <div className="root-container">
      <Button onClick={onBtnClick} type="primary">
        修改主题
      </Button>
      <p style={{ color: primaryColor, marginTop: 10 }}>click up btn to change theme</p>
      <p className="test-text">less file test</p>
      <p className="test-more">test import</p>
    </div>
  );
}
