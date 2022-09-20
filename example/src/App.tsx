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
    <div>
      <Button onClick={onBtnClick} type="primary">
        修改主题
      </Button>
      <p style={{ color: primaryColor }}>click up btn to change theme</p>
    </div>
  );
}
