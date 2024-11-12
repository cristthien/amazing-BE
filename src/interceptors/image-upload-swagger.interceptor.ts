import { ApiBody } from '@nestjs/swagger';

export const ApiMultiFile =
  (fileName: string = 'thumnail'): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      type: 'multipart/form-data',
      required: true,
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'array', // Make it an array for multiple files
            items: {
              type: 'string',
              format: 'binary',
            },
          },
          name: {
            type: 'string',
          },
          description: {
            type: 'string',
            nullable: true,
          },
        },
      },
    })(target, propertyKey, descriptor);
  };
