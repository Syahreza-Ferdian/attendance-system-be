import { Test, TestingModule } from '@nestjs/testing';
import { WorkScheduleController } from './work_schedule.controller';

describe('WorkScheduleController', () => {
  let controller: WorkScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkScheduleController],
    }).compile();

    controller = module.get<WorkScheduleController>(WorkScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
